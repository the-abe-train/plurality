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
    description: "A decentralized guessing game",
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
    "og:description": "A decentralized guessing game",
    "og:site_name": "Plurality",
    "og:image": "https://plurality.fun/preview.png",
    "og:image:alt": "Plurality: A decentralized guessing game",
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
      <body style={{ height: "100%" }}>
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
        <script
          src="https://widgets.snack-projects.co.uk/gdpr/snack-cmp_v2.min.js"
          id="snack-cmp"
          async
        ></script>
        <script
          type="text/javascript"
          async
          src="https://btloader.com/tag?o=5180208835985408&upapi=true"
        ></script>
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <script
          id="snack_ads"
          src="https://cdn-header-bidding.snack-media.com/assets/js/snack-loader/2903"
          crossOrigin="anonymous"
        ></script>
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
