import type { MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { ErrorBoundaryComponent } from "@remix-run/react/routeModules";
import styles from "./styles/app.css";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export const meta: MetaFunction = () => {
  const htmlAttributes = {
    title: "Plurality",
    viewport: "width=device-width,initial-scale=1",
    description: "A Web3 guessing game",
    "theme-color": "#FDFAF6",
  };
  const twitter = {
    "twitter:site": "@pluralitygame",
    "twitter:creator": "@theAbeTrain",
    "twitter:card": "summary",
    "twitter:image": "https://plurality.fun/preview-square.png",
  };
  const og = {
    "og:url": "https://plurality.fun",
    "og:title": "Plurality",
    "og:description": "A Web3 guessing game",
    "og:site_name": "Plurality",
    "og:image": "https://plurality.fun/preview.png",
    "og:image:alt": "Plurality: A Web3 guessing game",
  };

  return { charset: "utf-8", ...htmlAttributes, ...twitter, ...og };
};

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  console.error(error);
  return (
    <html>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <main className="light w-full top-0 bottom-0 flex flex-col min-h-screen p-12">
          <h1 className="font-header mb-2 text-2xl">{error.name}</h1>
          <pre>
            <code>{error.message}</code>
          </pre>
        </main>
        <Scripts />
      </body>
    </html>
  );
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
