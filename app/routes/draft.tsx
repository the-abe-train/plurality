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

import { UserSchema } from "~/db/schemas";
import { client } from "~/db/connect.server";
import { userById } from "~/db/queries";
import { NFT } from "~/api/schemas";
import { sendEmail } from "~/api/nodemailer";
import { getNfts } from "~/api/opensea";
import { ADMIN_EMAIL } from "~/util/env";

import { commitSession, getSession } from "~/sessions";

import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";

import { draftIcon } from "~/images/icons";

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
    session.flash("message", "You need to be logged-in to draft a Survey.");
    return redirect("/user/signup", {
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
      <div className="flex-grow">
        <Header name={loaderData.user ? loaderData.user.name : "Connect"} />
        <AnimatedBanner text="Draft" icon={draftIcon} />
        <main
          className="max-w-4xl flex flex-col md:grid grid-cols-2
        gap-4 my-6 justify-center md:mx-auto mx-4"
        >
          <section>
            <a href="https://buy.stripe.com/test_14k9Blgva1ic2EUaEE">
              Stripe link
            </a>
          </section>
          <section className="md:px-4">
            <h2 className="font-header text-2xl" data-cy="draft-header">
              Draft your Survey question
            </h2>
            {showForm && (
              <Form method="post" className="my-4 space-y-4">
                <textarea
                  className="w-full px-4 py-2 text-sm border border-outline"
                  name="question"
                  placeholder="Enter question text here."
                  minLength={10}
                  required
                />
                <div>
                  <label
                    htmlFor="photo"
                    className="flex items-center space-x-2 my-1"
                  >
                    <p>Unsplash photo ID</p>
                    <Tooltip
                      text="The string of characters at the end of the URL for 
              any photo on unsplash.com"
                    />
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 text-sm border border-outline"
                    name="photo"
                    required
                  />
                </div>
                <label
                  htmlFor="category"
                  className="flex items-center space-x-2"
                >
                  <p>Select Survey category:</p>
                  <select
                    name="category"
                    className="bg-white border border-outline px-1"
                  >
                    <option value="word">Word</option>
                    <option value="number">Number</option>
                  </select>
                </label>
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
                Survey question submitted successfully! If there is any issue
                with your submission, the Plurality team will let you know as
                soon as possible.{" "}
              </p>
            )}
          </section>
          <section className="md:self-end md:px-4">
            <div className="flex flex-wrap gap-3 my-3">
              <NavButton name="Respond" />
              <NavButton name="Draft" />
            </div>
            <Link to="/surveys?community=on&standard=on" className="underline">
              Play more Surveys
            </Link>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
};
