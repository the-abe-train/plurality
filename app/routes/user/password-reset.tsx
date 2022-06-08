import { useEffect, useState } from "react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useTransition } from "@remix-run/react";
import { client } from "~/db/connect.server";
import { userByEmail } from "~/db/queries";
import { getSession, commitSession } from "../../sessions";
import AnimatedBanner from "~/components/text/AnimatedBanner";
import userIcon from "~/images/icons/user.svg";
import { passwordResetBody } from "~/util/passwordReset";
import { sendEmail } from "~/api/nodemailer";
import { JWT_SIGNATURE } from "~/util/env";

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
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

type ActionData = {
  message: string;
  error: boolean;
};

export const action: ActionFunction = async ({ request }) => {
  // Parse form data
  const form = await request.formData();
  const email = (form.get("email") as string).toLowerCase();

  // Handle verify email
  const user = await userByEmail(client, email);

  if (!user) {
    const message = `No user with email address "${email}" found in the database`;
    return json<ActionData>({ message, error: true });
  }

  const emailBody = await passwordResetBody(email, JWT_SIGNATURE);
  const subject = "Verify Email for Plurality";
  const response = await sendEmail({ emailBody, emailTo: email, subject });
  if (response === 200) {
    const message = "Verification email sent.";
    return json<ActionData>({ message, error: false });
  }

  const message = "Server error. Please try again later.";
  return json<ActionData>({ message, error: true });
};

export default () => {
  const actionData = useActionData<ActionData>();
  const transition = useTransition();

  // TODO on dev server, request takes too long for success return message

  return (
    <main className="container flex-grow px-4 sm:px-0 mx-auto w-full max-w-4xl">
      <AnimatedBanner text="Reset Password" icon={userIcon} />
      <section className="flex justify-around flex-col md:flex-row my-4 md:my-8">
        <Form
          className="max-w-md space-y-6 my-6 flex flex-col items-center"
          method="post"
        >
          <p>
            Use this form to send a password-reset link to your email address.
          </p>
          <input
            type="email"
            name="email"
            className="w-full px-4 py-2 text-sm border rounded-md border-outline"
            placeholder="Email Address"
            required
          />
          <button
            className="silver px-3 py-2 block"
            type="submit"
            data-cy="submit"
            disabled={transition.state !== "idle"}
          >
            Send
          </button>
          <p
            className="text-left self-start"
            data-cy="message"
            style={{ color: actionData?.error ? "red" : "inherit" }}
          >
            {transition.state !== "idle" ? "Loading..." : actionData?.message}
          </p>
        </Form>
      </section>
      <section className="md:mt-8 my-4 md:px-4">
        <p>
          Remember your password?{" "}
          <Link to="/user/login" className="underline">
            Log-in
          </Link>
        </p>
      </section>
    </main>
  );
};
