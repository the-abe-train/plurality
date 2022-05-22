import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import { client } from "~/db/connect.server";
import { verifyUser } from "~/db/queries";
import { createVerifyEmailToken } from "~/util/verify";

export const loader: LoaderFunction = async ({ params }) => {
  const { email, hash } = params;
  invariant(email, "Failed to parse email verification string.");
  const verifyToken = await createVerifyEmailToken(email);
  if (hash === verifyToken) {
    await verifyUser(client, email);
    return redirect("/surveys/today");
  }
};

export default () => {
  return <div>Verify route</div>;
};
