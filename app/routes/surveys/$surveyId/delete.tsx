import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import invariant from "tiny-invariant";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";

import { client } from "~/db/connect.server";
import { deleteGame } from "~/db/queries";

import { commitSession, getSession } from "~/sessions";
import { surveyCatch } from "~/routeApis/surveyCatch";

import { surveyMeta } from "~/routeApis/surveyMeta";

dayjs.extend(utc);
dayjs.extend(timezone);

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: backgrounds },
  ];
};

export const meta = surveyMeta;
export const CatchBoundary = surveyCatch;

export const loader: LoaderFunction = async ({ params, request }) => {
  // Get user info
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user");
  const surveyId = Number(params.surveyId);

  // Redirect not signed-in users to home page
  if (!userId) {
    // User can play exactly one game if they're not signed in.
    // Check if the player already has a game in the session
    if (session.has("game") && session.get("game") !== surveyId) {
      session.flash(
        "message",
        `You need to be logged-in to play more Surveys.
        (You have already played Survey ${session.get("game")})`
      );
      return redirect("/user/signup", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    // Set the sample game for this not-logged-in user
    session.set("game", surveyId);

    // Send user to sample page
    return redirect(`/surveys/${surveyId}/sample`, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  // Delete game
  const deleteResult = await deleteGame(client, userId, surveyId);
  invariant(deleteResult, "Game delete failed");

  return redirect(`/`, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
    statusText: "Game deleted",
  });
};
