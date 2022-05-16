import type {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";

import Footer from "~/components/navigation/Footer";
import Header from "~/components/navigation/Header";
import Tooltip from "~/components/information/Tooltip";
import AnimatedBanner from "~/components/text/AnimatedBanner";
import NavButton from "~/components/buttons/NavButton";
import NFTList from "~/components/lists/NFTList";

import { UserSchema } from "~/db/schemas";
import { client } from "~/db/connect.server";
import { userById } from "~/db/queries";
import { NFT } from "~/api/schemas";
import { sendEmail } from "~/api/nodemailer";
import { fetchPhoto } from "~/api/unsplash";
import { getNfts } from "~/api/opensea";
import { ADMIN_EMAIL } from "~/util/env";

import { commitSession, getSession } from "~/sessions";

import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";

import draftSymbol from "~/images/icons/draft.svg";
import openSeaIcon from "~/images/icons/open_sea.svg";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: backgrounds },
  ];
};

type LoaderData = {
  user: UserSchema;
  nfts: NFT[];
  enabled: boolean;
  message?: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  // Get user info
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user");
  const user = (await userById(client, userId)) || undefined;

  // Redirect not signed-in users to home page
  if (!user) {
    session.flash("message", "You need to be logged-in to draft a survey.");
    return redirect("/user/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  // Get list of NFTs on account using OpenSea API
  const { wallet } = user;
  if (wallet) {
    try {
      const nfts = await getNfts(wallet);
      // Don't let them submit form if user email address isn't verified
      if (!user.email.verified) {
        const message =
          "Your email address must be verified to submit a Draft.";
        return json<LoaderData>({ user, nfts, message, enabled: false });
      }

      // Return data
      const data = { user, nfts, enabled: true };
      // console.log(data);
      return json<LoaderData>(data);
    } catch (e) {
      console.log(e);
      const message = "An error occurred. Please try again later.";
      return json<LoaderData>({ user, nfts: [], message, enabled: false });
    }
  }
  const message =
    "Your Ethereum wallet must be connected in order to submit a Draft.";
  return json<LoaderData>({ user, nfts: [], message, enabled: false });
};

type ActionData = {
  message: string;
  success: boolean;
};

export const action: ActionFunction = async ({ request }) => {
  // Async parse form and session data
  const [form, session] = await Promise.all([
    request.formData(),
    getSession(request.headers.get("Cookie")),
  ]);

  // Extract data from form
  const id = form.get("id");
  const survey = form.get("question");
  const photo = form.get("photo");
  const email = form.get("email");

  // Get user ID from session
  const user = session.get("user");

  // Verify the that the data entered exists
  if (
    typeof id !== "string" ||
    id.length <= 0 ||
    typeof survey !== "string" ||
    survey.length <= 0 ||
    typeof photo !== "string" ||
    photo.length <= 0 ||
    typeof email !== "string" ||
    email.length <= 0
  ) {
    const message = "Please fill out all fields.";
    const success = false;
    return json<ActionData>({ message, success });
  }

  // Verify that the ID is allowed (shouldn't be necessary because of frontend)
  const allowableIds = [100];
  if (!allowableIds.includes(Number(id))) {
    const message = "Survey number is not allowed";
    const success = false;
    return json<ActionData>({ message, success });
  }

  // Verify that the Unsplash photo ID exists
  const checkPhoto = await fetchPhoto(photo);
  if (checkPhoto.errors) {
    const message = "Invalid photo ID";
    const success = false;
    return json<ActionData>({ message, success });
  }

  // Send email with info from the user
  const emailBody = `
  <h3>Contact Details</h3>
  <ul>
    <li>User ID: ${user}</li>
    <li>Email: ${email}</li>
  </ul>
  <h3>Survey id</h3>
  <p>${id}</p>
  <h3>Survey text</h3>
  <p>${survey}</p>
  <h3>Unsplash photo</h3>
  <p>https://unsplash.com/photos/${photo}</p>
  `;
  const subject = "Survey Draft Submission";
  const emailTo = ADMIN_EMAIL;
  const mailerResp = await sendEmail({ emailBody, emailTo, subject });
  if (mailerResp === 200) {
    const message = "Survey draft submitted successfully!";
    const success = true;
    return json<ActionData>({ message, success });
  }

  // Tell user that it failed for unknown reason
  const message =
    "Unkown error ocurred. Please reach out to The Abe Train on Twitter for assistance.";
  const success = false;
  return json<ActionData>({ message, success });
};

export default () => {
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const [showForm, setShowForm] = useState(true);
  const [enabled, setEnabled] = useState(loaderData.enabled);
  const [msg, setMsg] = useState(loaderData.message || actionData?.message);
  const [token, setToken] = useState("");

  const nfts = loaderData.nfts ? [...loaderData.nfts] : [];

  useEffect(() => {
    if (actionData?.success) {
      setShowForm(false);
    }

    if (actionData?.message) {
      setMsg(actionData.message);
    }

    // Disable form using transition, email verified, valid token selected
  }, [actionData]);

  return (
    <div className="light w-full top-0 bottom-0 flex flex-col min-h-screen">
      <Header name={loaderData.user ? loaderData.user.name : "Connect"} />
      <AnimatedBanner text="Draft" icon={draftSymbol} />
      <main
        className="container max-w-4xl flex-grow px-4 flex flex-col
    md:grid grid-cols-2 grid-flow-row gap-x-6 my-6"
      >
        <section>
          <h2 className="font-header text-2xl">Select your survey token</h2>
          <NFTList nfts={nfts} token={token} setToken={setToken} />
          <a href="https://opensea.io/PluralityGame">
            <button className="gold px-3 py-2 my-6 flex space-x-1 items-center mx-auto">
              <span>Buy a Token</span>
              <img src={openSeaIcon} alt="OpenSea" className="inline" />
            </button>
          </a>
        </section>
        <section>
          <h2 className="font-header text-2xl">Draft your Survey question</h2>
          {showForm && (
            <Form method="post" className="my-4 space-y-3">
              <textarea
                className="w-full px-4 py-2 text-sm border rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
                name="question"
              />
              <label htmlFor="photo" className="flex items-center space-x-2">
                <p>Unsplash photo ID </p>
                <Tooltip
                  text="The string of characters at the end of the URL for 
              any photo on unsplash.com"
                />
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 text-sm border rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
                name="photo"
              />
              <div>
                <button
                  className="gold px-6 py-2 block mx-auto my-6"
                  type="submit"
                  disabled={!enabled}
                >
                  Submit
                </button>
              </div>
              <p className="text-red-700">{msg}</p>
            </Form>
          )}
          {!showForm && (
            <p>
              Question submitted successfully! If there is any issue with your
              submission, the Plurality team will let you know as soon as
              possible.{" "}
            </p>
          )}
        </section>
        <div className="my-5">
          <div className="flex flex-wrap gap-3 my-3">
            <NavButton name="Guess" />
            <NavButton name="Respond" />
          </div>
          <Link to="/surveys" className="underline text-right w-full">
            Play more Surveys
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};
