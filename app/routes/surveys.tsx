import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";

import Footer from "~/components/navigation/Footer";
import Header from "~/components/navigation/Header";

import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";
import switchStyles from "~/styles/switch.css";

import { UserSchema } from "~/db/schemas";
import { userById } from "~/db/queries";
import { getSession } from "~/sessions";
import { client } from "~/db/connect.server";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: backgrounds },
    { rel: "stylesheet", href: switchStyles },
  ];
};

type LoaderData = {
  user?: UserSchema;
};

export const loader: LoaderFunction = async ({ request }) => {
  // Get user info
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user");
  const user = (await userById(client, userId)) || undefined;
  const data = { user };
  return json<LoaderData>(data);
};

export default function questions() {
  const data = useLoaderData<LoaderData>();
  return (
    <div className="light w-full top-0 bottom-0 flex flex-col min-h-screen">
      <Header name={data.user ? data.user.name : "Connect"} />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
