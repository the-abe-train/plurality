import dayjs from "dayjs";
import { ObjectId } from "mongodb";
import { useEffect, useState } from "react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import useConnectWithWallet from "~/hooks/useConnectWithWallet";
import { authorizeUser } from "~/util/authorize";
import { client } from "~/db/connect.server";
import { connectUserWallet, gameBySurveyUser } from "~/db/queries";
import { getSession, commitSession } from "../../sessions";
import AnimatedBanner from "~/components/text/AnimatedBanner";
import userIcon from "~/images/icons/user.svg";

type LoaderData = {
  message: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  // Upon visitng the page, gets the session from the headers
  // If the session has a user ID in it, redirects to home
  // If not, return nothing
  // Close connection to database
  // Return nothing

  const session = await getSession(request.headers.get("Cookie"));
  if (session.has("user")) {
    return redirect("/user");
  }

  const message = session.get("message") || null;
  session.unset("message");
  return json<LoaderData>(
    { message },
    {
      headers: {
        // only necessary with cookieSessionStorage
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

type ActionData = {
  message: string;
};

export const action: ActionFunction = async ({ request }) => {
  // Set-up
  const session = await getSession(request.headers.get("Cookie"));
  const nextWeek = dayjs().add(7, "day").toDate();

  // Parse form data
  const form = await request.formData();
  const email = (form.get("email") as string).toLowerCase();
  const password = form.get("password") as string;
  const wallet = form.get("wallet") as string;
  const localData = form.get("localData") as string;

  // Successful redirect function
  async function successfulRedirect(userId: ObjectId) {
    session.set("user", userId);
    const cookieString = await commitSession(session, {
      expires: nextWeek,
    });
    return redirect("/surveys/today", {
      headers: {
        "Set-Cookie": cookieString,
      },
    });
  }

  // Connect with wallet
  if (wallet) {
    const user = await connectUserWallet(client, wallet);
    if (user.value?._id) {
      return await successfulRedirect(user.value?._id);
    }
  }

  // Reject empty fields
  if (!email || !password) {
    return json<ActionData>({ message: "Please fill out all fields" });
  }

  // Check if user exists in system
  const { isAuthorized, userId } = await authorizeUser(email, password);

  // Reject unauthorized user
  if (!isAuthorized || !userId) {
    return json<ActionData>({ message: "Email and/or password is incorrect" });
  }

  // If there is a game in the local storage, uplaod it for the user.
  if (localData) {
    const { win, guesses, survey, guessesToWin } = JSON.parse(localData);
    await gameBySurveyUser({
      client,
      userId,
      surveyId: Number(survey),
      win: win === "true",
      guesses: JSON.parse(guesses),
      guessesToWin: Number(guessesToWin),
    });
  }

  // Redirect logged-in user to home page
  return await successfulRedirect(userId);
};

export default () => {
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const [localData, setLocalData] = useState("");
  const [message, setMessage] = useState(loaderData?.message);
  const connectWallet = useConnectWithWallet();

  // Create account using Ethereum wallet
  async function clickWalletConnect() {
    const message = await connectWallet();
    setMessage(message);
  }

  // Set message to action data message after form submission
  useEffect(() => {
    if (actionData?.message) {
      setMessage(actionData.message);
    }
  }, [actionData]);

  // If the player has already played a sample round, grab that data
  useEffect(() => {
    const survey = localStorage.getItem("survey");
    const guesses = localStorage.getItem("guesses");
    const win = localStorage.getItem("win");
    const guessesToWin = localStorage.getItem("guessesToWin");
    setLocalData(JSON.stringify({ survey, guesses, win, guessesToWin }));
  }, []);

  return (
    <main className="container flex-grow px-4 md:px-0 mx-auto w-full max-w-4xl">
      <AnimatedBanner text="Log in" icon={userIcon} />
      <section className="flex justify-around flex-col md:flex-row my-4 md:my-8">
        <article className="max-w-sm mx-auto md:mx-0">
          <h2 className="md:text-center text-2xl font-header">
            Option 1: Email & Password
          </h2>
          <Form
            className="max-w-md space-y-6 my-6 flex flex-col items-center"
            method="post"
          >
            <input
              type="email"
              name="email"
              className="w-full px-4 py-2 text-sm border rounded-md border-outline"
              placeholder="Email Address"
              required
            />
            <input
              className="w-full px-4 py-2 text-sm border rounded-md border-outline"
              placeholder="Password"
              type="password"
              name="password"
              minLength={8}
              required
            />
            <input
              className="hidden"
              type="text"
              name="localData"
              value={localData}
              readOnly
            />
            <button
              className="silver px-3 py-2 block"
              type="submit"
              data-cy="login"
            >
              Log-in
            </button>
            <p className="text-red-700 text-left self-start" data-cy="message">
              {message}
            </p>
          </Form>
        </article>
        <article className="max-w-sm mx-auto md:mx-0">
          <h2 className="text-center text-2xl font-header">
            Option 2: Ethereum wallet
          </h2>
          <div className="my-4 space-y-4">
            <button
              className="silver px-3 py-2 block mx-auto"
              onClick={clickWalletConnect}
            >
              Connect wallet
            </button>
            <p>
              If you have an Ethereum wallet connected to your account, you can
              draft your own survey questions!
            </p>
          </div>
        </article>
      </section>
      <section className="md:mt-8 my-4 md:px-4 space-y-4">
        <p>
          Don't have an account?{" "}
          <Link to="/user/signup" className="underline">
            Sign-up
          </Link>
        </p>
        <p>
          Forgot your password?{" "}
          <Link to="/user/password-reset" className="underline">
            Click here.
          </Link>
        </p>
      </section>
    </main>
  );
};
