import { useEffect, useState } from "react";
import type { ActionFunction, LoaderFunction, Session } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import Filter from "bad-words";

import { client } from "~/db/connect.server";
import {
  addVote,
  gameBySurveyUser,
  getFutureSurveys,
  surveyByClose,
  surveyById,
} from "~/db/queries";
import type { ObjectId } from "mongodb";

import { commitSession, getSession } from "~/sessions";

import Survey from "~/components/game/Survey";
import AnimatedBanner from "~/components/text/AnimatedBanner";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { respondIcon } from "~/images/icons";
import { parseFutureDate } from "~/util/text";
import { surveyMeta } from "~/routeApis/surveyMeta";

import useValidation from "~/hooks/useValidation";

import { surveyCatch } from "~/routeApis/surveyCatch";
import { getTypo } from "~/util/nlp";
import MiniNav from "~/components/navigation/MiniNav";
import { BLACKLIST } from "~/util/env";

dayjs.extend(utc);
dayjs.extend(timezone);

type LoaderData = {
  game: GameSchema;
  survey: SurveySchema;
  previews: SurveySchema[];
  lastSurveyDate?: string;
};

export const meta = surveyMeta;
export const CatchBoundary = surveyCatch;

async function getPreviews(userId: ObjectId, surveyId: number) {
  const futureSurveys = await getFutureSurveys(client, userId);
  if (futureSurveys.length === 0) {
    return { previews: [], lastSurveyDate: "" };
  }
  const lastSurvey = futureSurveys[futureSurveys.length - 1];
  const lastSurveyDate = dayjs(lastSurvey.surveyClose).format("YYYY-MM-DD");
  const previews = futureSurveys
    .filter((preview) => preview._id !== surveyId)
    .slice(0, 2);
  return { previews, lastSurveyDate };
}

export const loader: LoaderFunction = async ({ params, request }) => {
  // Params
  const surveyId = Number(params.surveyId);

  // Get user info
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user");

  // Redirect not signed-in users to home page
  if (!userId) {
    session.flash(
      "message",
      "You need to be logged-in to respond to a Survey."
    );
    return redirect("/user/signup", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  // Get data from db and apis
  const survey = await surveyById(client, surveyId);
  if (!survey) {
    throw new Response("Survey has not been drafted yet.", {
      status: 404,
    });
  }
  invariant(survey, "No Survey found!");

  // Redirect to guess if the survey is closed
  const surveyClose = survey.surveyClose;
  if (dayjs(surveyClose) < dayjs()) {
    return redirect(`/surveys/${surveyId}/guess`);
  }

  // Get additional data from db and apis
  const game = await gameBySurveyUser({ client, surveyId, userId });
  invariant(game, "Game upsert failed");

  // If the player has already voted
  if (!game.vote) {
    const data = { game, survey, previews: [] };
    return json<LoaderData>(data);
  }

  // Get future surveys
  const { previews, lastSurveyDate } = await getPreviews(userId, surveyId);

  // Accept correct guess
  return json<LoaderData>({
    game,
    survey,
    previews,
    lastSurveyDate,
  });
};

type ActionData = {
  message?: string;
  suggestion?: string;
};

export const action: ActionFunction = async ({ request, params }) => {
  console.log("Running respond page form, aka", action.name); // action
  console.log("Request body", await request.clone().text());

  // Async parse form and session data
  let form: FormData, session: Session;
  try {
    [form, session] = await Promise.all([
      request.formData(),
      getSession(request.headers.get("Cookie")),
    ]);
  } catch (e) {
    console.log("Form parse failed");
    console.error(e);
    const message =
      "The server has experienced an error. Please reach out to Trainwreck Labs (https://trainwrecklabs.com) for support.";
    return json<ActionData>({ message });
  }

  // Parse form
  const newVote = Number(form.get("vote")) || (form.get("vote") as string);
  const newDate = form.get("date") as string;
  const confirm = form.get("confirm") === "on";
  const { _action } = Object.fromEntries(form);

  // Submitting a vote
  if (_action === "submitResponse") {
    // Reject empty form submissions
    if (!newVote) {
      const message = "Please enter a vote";
      return json<ActionData>({ message });
    }

    // Check for typos
    if (typeof newVote === "string" && !confirm) {
      const suggestions = getTypo(newVote);
      console.log("Suggestions", suggestions);
      if (suggestions.length > 0) {
        const suggestion = suggestions[0];
        const message = `Wait! There may be a typo in your answer. Are you sure you didn't mean `;
        return json<ActionData>({ message, suggestion });
      }
    }

    // Remove guesses from blacklisted IPs
    // console.log("Blacklist:", BLACKLIST);
    const ipAddresses = request.headers.get("x-forwarded-for");
    // try {
    //   const blacklist = JSON.parse(BLACKLIST) as string[];
    //   if (ipAddresses) {
    //     const ipArray = ipAddresses.split(", ");
    //     console.log(blacklist, ipArray);
    //     if (blacklist.some((ip) => ipArray.includes(ip))) {
    //       console.log(`Response from ${ipAddresses} blocked.`);
    //       return {};
    //     }
    //   }
    // } catch (e) {
    //   console.log(`Failed to blacklist ${ipAddresses}`);
    //   console.error(e);
    // }

    // Check for bad words
    const surveyId = Number(params.surveyId);
    const filter = new Filter();
    filter.addWords("hitler", "slave", "negro", "niggerman", "niger", "nword");
    filter.removeWords("labia", "lust");
    if (surveyId === 181) filter.removeWords("dick");
    if (filter.isProfane(String(newVote).toLowerCase())) {
      console.log(`Prevented response ${newVote} due to profanity`);
      const message = "Sorry, that word is not allowed as Survey response.";
      return json<ActionData>({ message });
    }
    if (String(newVote).toLowerCase() === "idk") {
      const message =
        "I'm sure you can think of something if you try a bit harder!";
      return json<ActionData>({ message });
    }

    // Update game with new guess
    const userId = session.get("user");
    const updatedGame = await addVote(client, surveyId, userId, newVote);
    invariant(updatedGame, "Game update failed");

    console.log(
      `Response "${newVote}" successfully submitted for Survey #${surveyId} from IP ${ipAddresses}`
    );
    return {};
  }

  if (_action === "changeSurvey") {
    const [year, month, day] = newDate.split("-").map((str) => Number(str));
    const midnight = new Date(
      Date.UTC(year, month - 1, day + 1, 3, 59, 59, 999)
    );
    const newSurvey = await surveyByClose(client, midnight);
    return redirect(`/surveys/${newSurvey?._id}/respond`);
  }

  const message = "Action not recognized.";
  return json<ActionData>({ message });
};

export default () => {
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const { surveyClose } = loaderData.survey;
  const [yourVote, setYourVote] = useState(loaderData.game.vote?.text);
  const [enabled, setEnabled] = useState(false);
  const [suggestion, setSuggestion] = useState(actionData?.suggestion || "");
  const [voteText, setVoteText] = useState(suggestion);
  const [datePicker, setDatePicker] = useState(
    dayjs(surveyClose).format("YYYY-MM-DD")
  );
  const [msg, setMsg] = useState("");
  const [msgColour, setMsgColour] = useState("auto");
  const [previewSurveys, setPreviewSurveys] = useState<SurveySchema[]>(
    loaderData.previews
  );
  const [lastSurveyDate, setLastSurveyDate] = useState(
    loaderData.lastSurveyDate
  );

  // Derived variables
  const placeholderText = "Type your Survey response here.";
  const nextSurvey = parseFutureDate(surveyClose);

  // Making sure "your vote" is correct
  useEffect(() => {
    const vote = loaderData.game.vote?.text;
    setYourVote(vote);
    setDatePicker(dayjs(surveyClose).format("YYYY-MM-DD"));
    if (vote) {
      setMsg("");
      setVoteText(String(vote));
    } else if (actionData?.message) {
      setMsg(actionData.message);
    } else {
      setVoteText("");
    }
    setSuggestion(actionData?.suggestion || "");
  }, [loaderData.game, actionData?.message, actionData?.suggestion]);

  // Updates from action data
  useEffect(() => {
    const newVote = loaderData.game.vote?.text;
    if (newVote) {
      setEnabled(false);
      setYourVote(newVote);
    }

    // Search for other surveys to respond to
    if (loaderData?.lastSurveyDate) {
      setLastSurveyDate(loaderData.lastSurveyDate);
    }
    if (loaderData?.previews) {
      setPreviewSurveys(loaderData.previews);
    }
  }, [loaderData.lastSurveyDate, loaderData.previews]);

  // This one is weird, but if the message is red, don't show a suggestion
  useEffect(() => {
    if (msgColour === "red") setSuggestion("");
  }, [msgColour]);

  // Text validation
  useValidation({
    voteText,
    category: loaderData.survey.category,
    setEnabled,
    setMsgColour,
    setMsg,
  });

  return (
    <>
      <AnimatedBanner text="Respond" icon={respondIcon} />
      <main
        className="max-w-4xl flex-grow px-4 mx-auto flex flex-col md:flex-row
    my-6 flex-wrap gap-3"
      >
        <div className="flex flex-col md:flex-row">
          <section className="mx-auto py-2 space-y-4 md:max-w-survey">
            <Survey survey={loaderData.survey} />
            <Form method="post" className="w-full flex space-x-2 my-4">
              <input
                type="text"
                name="vote"
                className="border border-outline py-1 px-2 
            bg-white disabled:bg-gray-300 w-full"
                disabled={!!yourVote}
                placeholder={placeholderText}
                maxLength={20}
                value={voteText}
                onChange={(e) => setVoteText(e.target.value)}
                data-cy="respond-input"
                required
                spellCheck
              />
              <input
                type="checkbox"
                name="confirm"
                readOnly
                className="hidden"
                checked={!!suggestion}
              />
              <button
                className="silver px-3 py-1"
                type="submit"
                name="_action"
                value="submitResponse"
                disabled={!enabled || !!yourVote}
              >
                {suggestion ? "Confirm" : "Enter"}
              </button>
            </Form>
            {yourVote && (
              <div className="min-h-[2rem] max-w-survey">
                <p>
                  Thank you for responding! Top responses can be guessed in{" "}
                  <b>{nextSurvey}</b>.
                </p>
              </div>
            )}
            {msg && (
              <p style={{ color: msgColour }}>
                {msg} {suggestion && <b>{suggestion}?</b>}
              </p>
            )}
          </section>
          <section className={`md:ml-8 w-fit ${yourVote && "hidden md:block"}`}>
            <h2 className="font-header mb-2 text-2xl">Instructions</h2>
            <p>Use this page to respond to the survey for an upcoming game!</p>
            <p>Your response to the survey should:</p>
            <ul className="list-disc list-outside ml-8">
              <li>Be only 1 word</li>
              <li>
                Be spelled correctly, with American English spellings preferred
              </li>
              <li>Not have any profanity or obscenity</li>
              <li>Only have unaccented letters or numbers</li>
            </ul>
            <MiniNav survey={loaderData.survey} page="respond" />
          </section>
        </div>
        {yourVote && (
          <section className="">
            <h2 className="font-header mb-2 text-2xl mt-2">
              Respond to another survey!
            </h2>
            <Form
              className="flex items-center md:space-x-4 mb-4 justify-around md:justify-start"
              method="post"
            >
              <label htmlFor="date" className="hidden md:block">
                Choose survey by date:
              </label>
              <input
                type="date"
                name="date"
                id="date"
                value={datePicker}
                onChange={(e) => setDatePicker(e.target.value)}
                min={dayjs().tz("America/Toronto").format("YYYY-MM-DD")}
                max={lastSurveyDate}
                disabled={previewSurveys.length === 0}
                className="border border-black px-2"
              />
              <button
                type="submit"
                className="silver px-3 py-1"
                name="_action"
                value="changeSurvey"
                disabled={previewSurveys.length === 0}
              >
                Select date
              </button>
            </Form>
            <div className="flex flex-wrap gap-4 md:w-full">
              {previewSurveys.map((survey, idx) => {
                return <Survey survey={survey} key={idx} />;
              })}
              {previewSurveys.length === 0 && (
                <p>
                  You've responded to all open Surveys! More Surveys will be
                  availble soon.
                </p>
              )}
            </div>
          </section>
        )}
      </main>
    </>
  );
};
