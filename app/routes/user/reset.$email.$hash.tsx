import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import AnimatedBanner from "~/components/text/AnimatedBanner";

import { userIcon } from "~/images/icons";
import { changePassword } from "~/util/authorize";
import { JWT_SIGNATURE } from "~/util/env";
import { createUserVerificationToken } from "~/util/verifyEmail";

type LoaderData = {
  message: string;
  error: boolean;
  email: string;
};

export const loader: LoaderFunction = async ({ params }) => {
  const { email, hash } = params;
  invariant(email, "Failed to parse email verification string.");
  const verifyToken = await createUserVerificationToken(email, JWT_SIGNATURE);

  if (hash !== verifyToken) {
    const message = "Password Reset link is incorrect. Please try again.";
    return json<LoaderData>({ message, email, error: true });
  }

  const message = `Password Reset Form ready for ${email}.`;
  return json<LoaderData>({ message, email, error: false });
};

type ActionData = {
  message: string;
  error: boolean;
};

export const action: ActionFunction = async ({ request }) => {
  // Parse form data
  const form = await request.formData();
  const email = form.get("email") as string;
  const password = form.get("password") as string;
  const verify = form.get("verify") as string;

  // Check that password and verify match
  if (password !== verify) {
    return json<ActionData>({
      message: "Password fields must match.",
      error: true,
    });
  }

  return changePassword(email, password);
};

export default () => {
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const { email, error, message } = loaderData;
  return (
    <main className="container flex-grow px-4 sm:px-0 mx-auto w-full max-w-4xl">
      <AnimatedBanner text="Reset Password" icon={userIcon} />
      <Form
        className="max-w-md space-y-6 my-6 flex flex-col items-center mx-auto"
        method="post"
      >
        <input
          className="w-full px-4 py-2 text-sm border rounded-md border-outline"
          type="email"
          name="email"
          value={email}
          readOnly
        />
        <input
          className="w-full px-4 py-2 text-sm border rounded-md border-outline"
          placeholder="Password"
          type="password"
          name="password"
          data-cy="password"
          minLength={8}
          required
        />
        <input
          className="w-full px-4 py-2 text-sm border rounded-md border-outline"
          placeholder="Verify password"
          type="password"
          name="verify"
          data-cy="verify"
          minLength={8}
          required
        />
        <button
          className="silver px-3 py-2 block"
          type="submit"
          data-cy="submit"
          disabled={
            error || actionData?.message === "Password changed successfully."
          }
        >
          Reset
        </button>
      </Form>
      <p
        className="text-left self-start"
        style={{ color: actionData?.error || error ? "red" : "inherit" }}
        data-cy="message"
      >
        {actionData?.message || message}
        {actionData?.message === "Password changed successfully." && (
          <>
            <span className="no-underline"> </span>
            <Link to="/user/login" className="underline">
              Click here to log-in.
            </Link>
          </>
        )}
      </p>
    </main>
  );
};
