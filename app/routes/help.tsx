import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";

import Footer from "~/components/navigation/Footer";
import Header from "~/components/navigation/Header";

import { UserSchema } from "~/db/schemas";
import { client } from "~/db/connect.server";
import { userById } from "~/db/queries";
import { getSession } from "~/sessions";

import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: backgrounds },
  ];
};

type LoaderData = {
  user?: UserSchema;
  path: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  // Get user info
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user");
  const user = (await userById(client, userId)) || undefined;

  const { url } = request;
  const path = url.split("/").pop() || "";

  // Return data
  const data = { user, path };
  return json<LoaderData>(data);
};

export default function help() {
  const data = useLoaderData<LoaderData>();
  return (
    <div className="light w-full top-0 bottom-0 flex flex-col min-h-screen">
      <Header name={data.user ? data.user.name : "Connect"} />
      {/* <AnimatedBanner icon={infoIcon} text="Info" /> */}

      <Outlet />

      <Footer />
    </div>
  );
}
