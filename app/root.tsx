import type { MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import styles from "./styles/app.css";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export const meta: MetaFunction = () => {
  const htmlAttributes = {
    title: "Plurality",
    viewport: "width=device-width,initial-scale=1",
    description: "A Web3 guessing game.",
    "theme-color": "#FDFAF6",
  };
  const twitter = {
    "twitter:site": "@pluralitygame",
    "twitter:creator": "@theAbeTrain",
    "twitter:card": "summary",
    "twitter:image": "https://plurality.fun/png",
  };
  const og = {
    "og:url": "https://plurality.fun",
    "og:title": "Plurality",
    "og:description": "A Web3 guessing game.",
    "og:site_name": "Plurality",
    "og:image": "https://plurality.fun/png",
  };

  return { charset: "utf-8", ...htmlAttributes, ...twitter, ...og };
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
