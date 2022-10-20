import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import { client } from "~/db/connect.server";
import { verifyUser } from "~/db/queries";
import { JWT_SIGNATURE } from "~/util/env";
import { createUserVerificationToken } from "~/util/verifyEmail";

export const loader: LoaderFunction = async ({ params }) => {
  const { email, hash } = params;
  invariant(email, "Failed to parse email verification string.");
  const verifyToken = await createUserVerificationToken(email, JWT_SIGNATURE);
  if (hash === verifyToken) {
    await verifyUser(client, email);
    return redirect("/surveys/today");
  }
  return {};
};

export default () => {
  return <></>;
};
