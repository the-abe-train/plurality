import { useEffect, useState } from "react";
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useCatch,
  useLoaderData,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { GameSchema, SurveySchema } from "~/db/schemas";
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
import NavButton from "~/components/buttons/NavButton";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { respondIcon } from "~/images/icons";
import { parseFutureDate } from "~/util/text";
import { CatchBoundaryComponent } from "@remix-run/react/routeModules";
import { surveyMeta } from "~/routeApis/surveyMeta";
import useValidation from "~/hooks/useValidation";

dayjs.extend(utc);
dayjs.extend(timezone);

type LoaderData = {
  game: GameSchema;
  survey: SurveySchema;
  previews?: SurveySchema[];
  lastSurveyDate?: string;
};

export const meta = surveyMeta;

async function getPreviews(userId: ObjectId, surveyId: number) {
  const futureSurveys = await getFutureSurveys(client, userId);
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

  return redirect(`/surveys/${surveyId}/sample`, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });

  // // Get data from db and apis
  // const survey = await surveyById(client, surveyId);
  // if (!survey) {
  //   throw new Response("Survey has not been drafted yet.", {
  //     status: 404,
  //   });
  // }
  // invariant(survey, "No Survey found!");

  // // Redirect to guess if the survey is closed
  // const surveyClose = survey.surveyClose;
  // if (dayjs(surveyClose) < dayjs()) {
  //   return redirect(`/surveys/${surveyId}/guess`);
  // }

  // // Get additional data from db and apis
  // const game = await gameBySurveyUser({ client, surveyId, userId });
  // invariant(game, "Game upsert failed");

  // // If the player has already voted
  // if (!game.vote) {
  //   const data = { game, survey };
  //   return json<LoaderData>(data);
  // }

  // // Get future surveys
  // const { previews, lastSurveyDate } = await getPreviews(userId, surveyId);

  // // Accept correct guess
  // return json<LoaderData>({
  //   game,
  //   survey,
  //   previews,
  //   lastSurveyDate,
  // });
};

type ActionData = {
  message: string;
  newVoteResult?: string | number;
  previews?: SurveySchema[];
  lastSurveyDate?: string;
};

export const action: ActionFunction = async ({ request, params }) => {
  // Async parse form and session data
  const [form, session] = await Promise.all([
    request.formData(),
    getSession(request.headers.get("Cookie")),
  ]);

  // Parse form
  const newVote = Number(form.get("vote")) || (form.get("vote") as string);
  const newDate = form.get("date") as string;
  const { _action } = Object.fromEntries(form);

  // Submitting a vote
  if (_action === "submitResponse") {
    // Reject empty form submissions
    if (!newVote) {
      const message = "Please enter a vote";
      return json<ActionData>({ message });
    }
    // Pull in relevant data
    const userId = session.get("user");
    const surveyId = Number(params.surveyId);
    const game = await gameBySurveyUser({ client, surveyId, userId });
    invariant(game, "Game upsert failed");

    // Update game with new guess
    const updatedGame = await addVote(client, game._id, newVote);
    invariant(updatedGame, "Game update failed");
    const message = "Thank you for voting!";
    const newVoteResult = updatedGame.vote?.text;

    // Get future surveys
    const { previews, lastSurveyDate } = await getPreviews(userId, surveyId);

    // Accept correct guess
    return json<ActionData>({
      message,
      newVoteResult,
      previews,
      lastSurveyDate,
    });
  }

  if (_action === "changeSurvey") {
    const [year, month, day] = newDate.split("-").map((str) => Number(str));
    const midnight = new Date(
      Date.UTC(year, month - 1, day + 1, 3, 59, 59, 999)
    );
    const newSurvey = await surveyByClose(client, midnight);
    return redirect(`/surveys/${newSurvey?._id}/respond`);
  }
};

export const CatchBoundary: CatchBoundaryComponent = () => {
  const caught = useCatch();

  return (
    <main className="max-w-4xl flex-grow mx-4 flex flex-col my-6 flex-wrap">
      <h1 className="font-header mb-2 text-2xl">Survey not found</h1>
      <p>Status: {caught.status}</p>
      <pre>
        <code>{JSON.stringify(caught.data, null, 2)}</code>
      </pre>
    </main>
  );
};

export default () => {
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const { surveyClose } = loaderData.survey;
  const [yourVote, setYourVote] = useState(loaderData.game.vote?.text);
  const [enabled, setEnabled] = useState(false);
  const [voteText, setVoteText] = useState("");
  const [datePicker, setDatePicker] = useState(
    dayjs(surveyClose).format("YYYY-MM-DD")
  );
  const [msg, setMsg] = useState("");
  const [msgColour, setMsgColour] = useState("auto");
  const [previewSurveys, setPreviewSurveys] = useState<SurveySchema[]>(
    loaderData.previews || []
  );
  const [lastSurveyDate, setLastSurveyDate] = useState(
    loaderData.lastSurveyDate
  );

  // Derived variables
  const placeholderText = "Type your Survey response here.";
  const nextSurvey = parseFutureDate(surveyClose);

  // Unsplash photo attributions
  const refLink = "?utm_source=plurality&utm_medium=referral";
  const unsplashLink = "https://unsplash.com/" + refLink;

  // Making sure "your vote" is correct
  useEffect(() => {
    setYourVote(loaderData.game.vote?.text);
    setDatePicker(dayjs(surveyClose).format("YYYY-MM-DD"));
    setVoteText("");
  }, [loaderData.game]);

  // Updates from action data
  useEffect(() => {
    const newVote = actionData?.newVoteResult;
    if (newVote) {
      setEnabled(false);
      setYourVote(newVote);
    }

    // Search for other surveys to respond to
    if (actionData?.lastSurveyDate) {
      setLastSurveyDate(actionData.lastSurveyDate);
    }
    if (actionData?.previews) {
      setPreviewSurveys(actionData.previews);
    }
  }, [actionData]);

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
        className="max-w-4xl flex-grow mx-4 md:mx-auto flex flex-col md:flex-row
    my-6 flex-wrap"
      >
        <div className="flex flex-col md:flex-row">
          <section className="md:px-4 py-2 space-y-4">
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
                spellCheck
              />
              <button
                className="silver px-3 py-1"
                type="submit"
                name="_action"
                value="submitResponse"
                disabled={!enabled}
              >
                Enter
              </button>
            </Form>
            {yourVote && (
              <div className="min-h-[2rem] max-w-survey">
                <p>
                  Your response is <b>{yourVote}</b>.
                </p>
                <p>
                  Survey responses can be guessed in <b>{nextSurvey}</b>.
                </p>
              </div>
            )}
            {msg && <p style={{ color: msgColour }}>{msg}</p>}
          </section>
          <section className={`md:px-4 w-fit ${yourVote && "hidden md:block"}`}>
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

            <div className="my-4 md:mt-12">
              <div className="flex flex-wrap gap-3 my-3">
                <NavButton name="Guess" />
                <NavButton name="Draft" />
              </div>
              <Link to="/surveys" className="underline text-right w-full">
                Play more Surveys
              </Link>
            </div>
          </section>
        </div>
        {yourVote && (
          <section className="md:px-4">
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
                className="border border-black px-2"
              />
              <button
                type="submit"
                className="silver px-3 py-1"
                name="_action"
                value="changeSurvey"
              >
                Select date
              </button>
            </Form>
            <div className="flex flex-wrap gap-4 md:w-full">
              {previewSurveys.map((survey, idx) => {
                return <Survey survey={survey} key={idx} />;
              })}
            </div>
            <p className="text-sm my-4 italic">
              Survey photos from{" "}
              <a className="underline my-3" href={unsplashLink}>
                Unsplash
              </a>
            </p>
          </section>
        )}
      </main>
    </>
  );
};
