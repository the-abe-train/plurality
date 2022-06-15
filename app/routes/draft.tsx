import type {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { useState } from "react";

import Footer from "~/components/navigation/Footer";
import Header from "~/components/navigation/Header";
import Tooltip from "~/components/information/Tooltip";
import AnimatedBanner from "~/components/text/AnimatedBanner";
import NavButton from "~/components/buttons/NavButton";

import { DraftSchema, UserSchema } from "~/db/schemas";
import { client } from "~/db/connect.server";
import { getDrafts, userById } from "~/db/queries";
import { sendEmail } from "~/api/nodemailer";
import { ADMIN_EMAIL } from "~/util/env";

import { commitSession, getSession } from "~/sessions";

import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";

import { draftIcon } from "~/images/icons";
import dayjs from "dayjs";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: backgrounds },
  ];
};

type LoaderData = {
  user: UserSchema;
  enabled: boolean;
  drafts: DraftSchema[];
  message?: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  // Get user info
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user");

  // Get data from db
  const [user, drafts] = await Promise.all([
    userById(client, userId),
    getDrafts(client, userId),
  ]);

  console.log(drafts);

  // Redirect not signed-in users to home page
  if (!user) {
    session.flash("message", "You need to be logged-in to draft a Survey.");
    return redirect("/user/signup", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  try {
    // Don't let them submit form if user email address isn't verified
    if (!user.email.verified) {
      const message = "Your email address must be verified to submit a Draft.";
      return json<LoaderData>({ user, message, drafts, enabled: false });
    }

    // Return data
    const data = { user, drafts, enabled: true };
    return json<LoaderData>(data);
  } catch (e) {
    console.log(e);
    const message = "An error occurred. Please try again later.";
    return json<LoaderData>({ user, message, drafts, enabled: false });
  }
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
  const { user, enabled, message, drafts } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const [msg, setMsg] = useState(message || actionData?.message);

  return (
    <div className="light w-full top-0 bottom-0 flex flex-col min-h-screen">
      <div className="flex-grow">
        <Header name={user ? user.name : "Connect"} />
        <AnimatedBanner text="Draft" icon={draftIcon} />
        <main
          className="max-w-4xl flex flex-col md:grid grid-cols-2
        gap-4 my-6 justify-center md:mx-auto mx-4"
        >
          <section>
            <h2 className="font-header text-2xl" data-cy="draft-header">
              Your Drafts
            </h2>
            <table className="table-auto my-4 bg-white border-outline">
              <colgroup className="border">
                <col className="border border-outline min-w-[3rem]" />
                <col className="border border-outline min-w-[3rem]" />
                <col className="border border-outline min-w-[3rem]" />
                <col className="border border-outline min-w-[3rem]" />
              </colgroup>
              <tbody>
                <tr className="border border-outline">
                  <td className="px-2 py-2">Submitted</td>
                  <td className="px-2 py-2">Text</td>
                  <td className="px-2 py-2">Status</td>
                </tr>
                {drafts.map(({ text, status, submitted }, idx) => {
                  return (
                    <tr key={idx} className="text-sm">
                      <td className="px-2 py-2">
                        {dayjs(submitted).format("DD/mm/YYYY")}
                      </td>
                      <td className="px-2 py-2">{text}</td>
                      <td className="px-2 py-2">{status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <a
              href="https://buy.stripe.com/test_14k9Blgva1ic2EUaEE"
              className="underline"
            >
              Stripe link
            </a>
          </section>
          <section className="md:pl-4">
            <h2 className="font-header text-2xl" data-cy="draft-header">
              Draft your Survey question
            </h2>

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
              <label htmlFor="category" className="flex items-center space-x-2">
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
          </section>
          <section className="md:self-end">
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
