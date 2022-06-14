import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useSubmit,
  useTransition,
} from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { sendEmail } from "~/api/nodemailer";

import { getSession, destroySession } from "../../sessions";
import useAttachWallet from "~/hooks/useAttachWallet";
import { verifyEmailBody } from "~/util/verifyEmail";
import { percentFormat, truncateEthAddress, truncateName } from "~/util/text";
import { authorizeWallet } from "~/util/authorize";

import { UserSchema } from "~/db/schemas";
import { client } from "~/db/connect.server";
import {
  deleteUser,
  removeWallet,
  surveysByAuthor,
  userById,
  gamesByUser,
  userUpdateEmail,
  userUpdateName,
  userUpdateWallet,
} from "~/db/queries";
import { NFT } from "~/api/schemas";
import { getNfts } from "~/api/opensea";

import AnimatedBanner from "~/components/text/AnimatedBanner";
import Counter from "~/components/text/Counter";
import NFTList from "~/components/lists/NFTList";

import {
  guessIcon,
  respondIcon,
  draftIcon,
  userIcon,
  openSeaLogo,
} from "~/images/icons";
import { NAME_LENGTH } from "~/util/gameplay";
import { JWT_SIGNATURE } from "~/util/env";

type LoaderData = {
  user: UserSchema;
  nfts: NFT[];
  userStats: {
    gamesWon: number;
    responsesSubmitted: number;
    gamesPlayed: number;
    surveysDrafted: number;
    highestScore: { survey: number; score: number };
    fewestGuesses: { survey: number; guesses: number };
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user");
  const user = (await userById(client, userId)) || undefined;
  // Redirect to log-in page if user not signed in
  if (!user) {
    return redirect("/user/signup");
  }

  // Get list of NFTs on account using OpenSea API
  const { wallet } = user;
  const nfts = wallet ? await getNfts(wallet) : [];

  // Get user stats
  const [surveysList, games] = await Promise.all([
    surveysByAuthor(client, userId),
    gamesByUser(client, userId),
  ]);

  const highScoreGame = games
    .filter((game) => game.score)
    .sort((a, z) => z.score - a.score)[0];
  const fewestGuessesGame = games
    .filter((game) => game.guessesToWin)
    .sort((a, z) => {
      if (a.guessesToWin && z.guessesToWin) {
        return a.guessesToWin - z.guessesToWin;
      }
      return 0;
    })[0];

  const userStats = {
    gamesWon: games.filter((game) => game.win).length,
    responsesSubmitted: games.filter((game) => !!game.vote).length,
    gamesPlayed: games.filter((game) => game.guesses.length > 0).length,
    highestScore: {
      survey: highScoreGame ? highScoreGame.survey : 0,
      score: highScoreGame ? highScoreGame.score : 0,
    },
    fewestGuesses: {
      survey: fewestGuessesGame ? fewestGuessesGame.survey : 0,
      guesses: fewestGuessesGame ? fewestGuessesGame.guessesToWin : 0,
    },
    surveysDrafted: surveysList.length,
  };

  const data = { user, userStats, nfts };
  return json(data);
};

type ActionData = {
  message: string;
  error: boolean;
};

export const action: ActionFunction = async ({ request }) => {
  console.log("Running profile page form, aka", action.name); // action9
  // Async parse form and session data
  const [form, session] = await Promise.all([
    request.formData(),
    getSession(request.headers.get("Cookie")),
  ]);

  // Get user info from cookie
  const userId = session.get("user");

  // Parse forms
  const { _action } = Object.fromEntries(form);
  const newEmailRaw = form.get("email") as string;
  const newEmail = newEmailRaw ? newEmailRaw.toLowerCase() : "";
  const newName = form.get("name") as string;
  const wallet = form.get("wallet") as string;

  // Handle verify email
  if (_action === "verifyEmail") {
    const user = await userById(client, userId);
    if (user) {
      const emailTo = user.email.address;
      const emailBody = await verifyEmailBody(emailTo, JWT_SIGNATURE);
      const subject = "Verify Email for Plurality";
      const response = await sendEmail({ emailBody, emailTo, subject });
      if (response === 200) {
        const message = "Verification email sent.";
        return json<ActionData>({ message, error: false });
      }
    }
  }

  // Handle email change form
  if (_action === "changeEmail" && newEmail) {
    const output = await userUpdateEmail(client, userId, newEmail);
    if (!output?._id.equals(userId)) {
      const message = "This email is already attached to another account.";
      return json<ActionData>({ message, error: true });
    }
    const message = "Email updated successfully.";
    return json<ActionData>({ message, error: false });
  }

  // Handle name change form
  if (_action === "changeName" && newName) {
    await userUpdateName(client, userId, newName);
    const message = "Name updated successfully.";
    return json<ActionData>({ message, error: false });
  }

  // Handle attach wallet form
  if (_action === "attachWallet" && wallet) {
    // Check if wallet is already attached to another account
    const { isAuthorized } = await authorizeWallet(userId, wallet);
    if (!isAuthorized) {
      const message = "Wallet is already attached to another account.";
      return json<ActionData>({ message, error: true });
    }
    return await userUpdateWallet(client, userId, wallet);
  }

  // Handle detach wallet form
  if (_action === "detachWallet") {
    return await removeWallet(client, userId);
  }

  // Handle log-out form
  if (_action === "logOut") {
    const session = await getSession(request.headers.get("Cookie"));
    // Destroys the session in the database
    // Sends an unauthenticated cookie back to the user
    const cookieString = await destroySession(session);
    return redirect("/", {
      headers: {
        "Set-Cookie": cookieString,
      },
    });
  }

  // Handle delete account
  if (_action === "delete") {
    await deleteUser(client, userId);
    const session = await getSession(request.headers.get("Cookie"));
    const cookieString = await destroySession(session);
    return redirect("/", {
      headers: {
        "Set-Cookie": cookieString,
      },
    });
  }
  return "";
};

export default () => {
  const { user, userStats, nfts } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  const transition = useTransition();

  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const attachWallet = useAttachWallet();
  const submit = useSubmit();
  const deleteFormRef = useRef<HTMLFormElement>(null!);

  useEffect(() => {
    if (actionData?.message) {
      setMessage(actionData.message);
      setError(actionData.error);
    }
  }, [actionData?.message]);

  async function clickAttachWallet() {
    const newMessage = await attachWallet();
    setMessage(newMessage);
  }

  function confirmDeleteAccount() {
    const confirmed = confirm("Are you sure you want to delete your account?");
    if (confirmed) {
      const newFormData = new FormData(deleteFormRef.current);
      newFormData.set("_action", "delete");
      submit(newFormData, {
        method: "post",
        action: "/user?index",
        replace: true,
      });
    }
    return;
  }

  const wonAnyGames = !!userStats.fewestGuesses.guesses;

  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email.address || "");
  return (
    <main className="container max-w-4xl flex-grow px-4">
      <AnimatedBanner text={truncateName(user.name)} icon={userIcon} />
      <div
        className=" flex flex-col
    md:grid grid-cols-2 grid-flow-row gap-8"
      >
        <section className="space-y-4">
          <h2 className="text-2xl mb-3 font-header">Profile</h2>
          <Form method="post">
            <h3 className="text-xl my-2 font-header">Email</h3>
            <div className="block md:flex md:space-x-3">
              <input
                type="email"
                placeholder={user.email.address}
                className="px-3 py-1 border-outline border rounded-sm w-full md:w-auto"
                maxLength={40}
                value={email}
                name="email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="my-2 md:my-0 space-x-2">
                <button
                  type="submit"
                  name="_action"
                  value="changeEmail"
                  className="silver px-3 py-1"
                  disabled={email === user.email.address}
                >
                  Change
                </button>
                <button
                  type="submit"
                  name="_action"
                  value="verifyEmail"
                  className="gold px-3 py-1"
                  disabled={
                    user.email.verified ||
                    actionData?.message === "Verification email sent." ||
                    transition.state !== "idle"
                  }
                >
                  {user.email.verified ? "Verified" : "Verify"}
                </button>
              </div>
            </div>
          </Form>
          <Form method="post">
            <h3 className="text-xl my-2 font-header">Name</h3>
            <div className="flex space-x-3">
              <input
                type="text"
                value={name}
                name="name"
                className="px-3 py-1 border-outline border rounded-sm"
                onChange={(e) => setName(e.target.value)}
                maxLength={NAME_LENGTH}
                required
              />
              <button
                type="submit"
                name="_action"
                value="changeName"
                className="silver px-3 py-1"
                disabled={name === user.name}
              >
                Change
              </button>
            </div>
          </Form>
          <Form method="post">
            <h3 className="text-xl my-2 font-header">Ethereum Wallet</h3>
            <div className="flex space-x-3">
              <p className="px-3 py-1 border-outline border rounded-sm bg-gray-200 w-[225px]">
                {truncateEthAddress(user.wallet || "") || "Not connected"}
              </p>
              {!user.wallet ? (
                <button className="gold px-3 py-1" onClick={clickAttachWallet}>
                  Connect
                </button>
              ) : (
                <button
                  type="submit"
                  name="_action"
                  value="detachWallet"
                  className="cancel px-3 py-1"
                >
                  Disconnect wallet
                </button>
              )}
            </div>
          </Form>
          {message && (
            <p style={{ color: error ? "red" : "" }}>
              {transition.state !== "idle" ? "Loading..." : message}
            </p>
          )}
        </section>
        <section className="space-y-5">
          <h2 className="text-2xl my-2 font-header">Statistics</h2>
          <div className="flex w-full justify-around">
            <div className="flex space-x-3 items-center">
              <img src={guessIcon} width={32} alt="Guess icon" />
              <Counter value={userStats.gamesWon} />
            </div>
            <div className="flex space-x-3 items-center">
              <img src={respondIcon} width={32} alt="Respond icon" />
              <Counter value={userStats.responsesSubmitted} />
            </div>
            <div className="flex space-x-3 items-center">
              <img src={draftIcon} width={32} alt="Draft icon" />
              <Counter value={userStats.surveysDrafted} />
            </div>
          </div>
          <table className="table-auto">
            <colgroup>
              <col />
              <col className="bg-yellow-50 border min-w-[3rem]" />
              <col />
              <col className="bg-yellow-50 border min-w-[3rem]" />
            </colgroup>
            <tbody>
              <tr className="border">
                <td className="px-2 py-2">Games won</td>
                <td className="px-2 py-2 text-center">{userStats.gamesWon}</td>
                <td className="px-2 py-2">Games played</td>
                <td className="px-2 py-2 text-center">
                  {userStats.gamesPlayed}
                </td>
              </tr>
              <tr className="border">
                <td className="px-2 py-2">Responses submitted</td>
                <td className="px-2 py-2 text-center">
                  {userStats.responsesSubmitted}
                </td>
                <td className="px-2 py-2">Highest score</td>
                <td className="px-2 py-2 text-center">
                  {wonAnyGames &&
                    `${percentFormat(userStats.highestScore.score)} (#${
                      userStats.highestScore.survey
                    })`}
                </td>
              </tr>
              <tr className="border">
                <td className="px-2 py-2">Surveys drafted</td>
                <td className="px-2 py-2 text-center">
                  {userStats.surveysDrafted}
                </td>
                <td className="px-2 py-2">Fewest guesses to win</td>
                <td className="px-2 py-2 text-center">
                  {wonAnyGames &&
                    `${userStats.fewestGuesses.guesses} (#${userStats.fewestGuesses.survey})`}
                </td>
              </tr>
            </tbody>
          </table>
        </section>
        <section className="">
          <h2 className="text-2xl my-2 font-header">Account</h2>
          <div className="flex space-x-3">
            <Form method="post" className="space-x-4">
              <button
                type="submit"
                name="_action"
                value="logOut"
                className="silver px-3 py-1"
                data-cy="logout"
              >
                Logout
              </button>
            </Form>
            <Form className="space-x-4" ref={deleteFormRef}>
              <button
                className="cancel px-3 py-1"
                onClick={confirmDeleteAccount}
                data-cy="delete-account"
              >
                Delete
              </button>
            </Form>
          </div>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl my-2 font-header">Survey tokens</h2>
          <NFTList nfts={nfts} />
          <div className="flex space-x-3">
            <a href="https://opensea.io/PluralityGame">
              <button className="gold px-3 py-1 flex items-center space-x-1">
                <span> Buy a Survey Token </span>
                <img
                  className="inline-block"
                  src={openSeaLogo}
                  alt="Open Sea"
                />
              </button>
            </a>
            <Link to="/draft">
              <button className="gold px-3 py-1">Submit a draft</button>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};
