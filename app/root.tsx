import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import { ErrorBoundaryComponent } from "@remix-run/react/routeModules";
import { useEffect } from "react";
import SnackAdUnit from "./components/ads/SnackAdUnit";
import styles from "./styles/app.css";
import * as gtag from "~/util/gtags.client";

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

type LoaderData = {
  gaTrackingId: string | undefined;
};

// Load the GA tracking id from the .env
export const loader: LoaderFunction = async () => {
  return json<LoaderData>({ gaTrackingId: process.env.GA_TRACKING_ID });
};

export default function App() {
  const location = useLocation();
  const { gaTrackingId } = useLoaderData<LoaderData>();
  useEffect(() => {
    if (gaTrackingId?.length) {
      gtag.pageview(location.pathname, gaTrackingId);
    }
  }, [location, gaTrackingId]);
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
        {process.env.NODE_ENV === "development" || !gaTrackingId ? null : (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`}
            />
            <script
              async
              id="gtag-init"
              dangerouslySetInnerHTML={{
                __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaTrackingId}', {
                  page_path: window.location.pathname,
                });
              `,
              }}
            />
          </>
        )}

        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        {/* <SnackAdUnit siteId="2903" /> */}
      </body>
    </html>
  );
}
