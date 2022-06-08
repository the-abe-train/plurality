import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";

import { client } from "~/db/connect.server";
import { gameBySurveyUser, surveyById, surveyScores } from "~/db/queries";

import { GameSchema, RankedVote, SurveySchema } from "~/db/schemas";

import { commitSession, getSession } from "~/sessions";
import { calcMaxGuesses, getTotalVotes } from "~/util/gameplay";
import { resultsIcon } from "~/images/icons";
import { surveyCatch } from "~/routeApis/surveyCatch";

import Answers from "~/components/lists/Answers";
import Scorebar from "~/components/game/Scorebar";
import Switch from "~/components/buttons/Switch";
import AnimatedBanner from "~/components/text/AnimatedBanner";
import NavButton from "~/components/buttons/NavButton";

import { getLemma, surveyAnswers } from "~/util/nlp";
import { surveyMeta } from "~/routeApis/surveyMeta";
import { percentFormat } from "~/util/text";
import Histogram from "~/components/information/Histogram";
import { assignBins, getAverage, getBin, percentRank } from "~/util/statistics";

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

type LoaderData = {
  game: GameSchema;
  gameOver: boolean;
  survey: SurveySchema;
  totalVotes: number;
  maxGuesses: number;
  topAnswers: RankedVote[];
  scoreData: Record<string, number>;
  avgScore: number;
  userRank: number;
};

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
        "You need to be logged-in to view Survey results."
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

  // Get surveys
  let [survey, answers, game, scores] = await Promise.all([
    surveyById(client, surveyId),
    surveyAnswers(client, surveyId),
    gameBySurveyUser({ client, surveyId, userId }),
    surveyScores(client, surveyId),
  ]);
  if (!survey) {
    throw new Response("Survey has not been drafted yet.", {
      status: 404,
    });
  }
  invariant(game, "Game not found failed");

  // Redirect to Respond if survey close hasn't happened yet
  const surveyClose = survey.surveyClose;
  if (dayjs(surveyClose) >= dayjs()) {
    return redirect(`/surveys/${surveyId}/respond`);
  }

  // Get stats for user
  const totalVotes = getTotalVotes(answers);
  const maxGuesses = calcMaxGuesses(answers);
  const gameOver = game.guesses.length >= maxGuesses || game.score === 1;
  const scoreData = assignBins(scores, 0.02);
  const avgScore = getAverage(scores);
  const userRank = percentRank(scores, game.score);

  // Redirect to guess if game isn't over yet
  if (!gameOver) {
    return redirect(`/surveys/${surveyId}/guess`);
  }

  const data = {
    totalVotes,
    game,
    gameOver,
    survey,
    maxGuesses,
    topAnswers: answers.slice(0, maxGuesses),
    scoreData,
    avgScore,
    userRank,
  };

  return json<LoaderData>(data, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export default () => {
  // Data from server
  const loaderData = useLoaderData<LoaderData>();
  const {
    totalVotes,
    maxGuesses,
    survey,
    game,
    topAnswers,
    scoreData,
    userRank,
  } = loaderData;

  // Initial states are from loader data
  const [gameOver, setGameOver] = useState(loaderData.gameOver);
  const [win, setWin] = useState(game.win || false);
  const [displayPercent, setDisplayPercent] = useState(false);
  const [guessesToWin, setGuessesToWin] = useState(
    game.guessesToWin || game.guesses.length
  );

  // Displaying to the user what they voted
  const userVote = useMemo(() => {
    const rawUserVote = game.vote?.text;
    const voteDate = game.vote?.date;
    const surveyCloseDate = survey.surveyClose;
    if (!rawUserVote || !voteDate)
      return (
        <p className="text-sm mt-2">
          Survey closed on {dayjs(surveyCloseDate).format("D MMMM YYYY")}.
        </p>
      );
    let voteText = rawUserVote;
    if (typeof rawUserVote === "string") {
      const lemmaUserVote = getLemma(rawUserVote);
      if (lemmaUserVote !== rawUserVote) {
        voteText = `${lemmaUserVote} (${rawUserVote})`;
      }
    }
    return (
      <p className="text-sm mt-2">
        You responded <b>{voteText}</b> on{" "}
        <b>{dayjs(voteDate).format("D MMMM YYYY")}</b>.
      </p>
    );
  }, [game, survey]);

  // Ensure state changes when the Survey number changes
  useEffect(() => {
    setWin(game.win || false);
    setGuessesToWin(game.guessesToWin || guessesToWin);
    setGameOver(loaderData.gameOver || gameOver);
  }, [game, loaderData.gameOver]);

  // Calculated values
  const points = getTotalVotes(game.guesses);
  const score = points / totalVotes;
  const scorebarProps = {
    points,
    score,
    guesses: game.guesses,
    win,
    gameOver,
    surveyId: loaderData.survey._id,
    guessesToWin,
    maxGuesses,
  };
  const userScore = {
    guessesToWin,
    bin: getBin(game.score, 0.02),
    win,
  };
  const highlights = game.guesses.map((guess) => guess._id);

  return (
    <>
      <AnimatedBanner text="Results" icon={resultsIcon} />
      <main
        className="max-w-4xl flex-grow flex flex-col md:grid grid-cols-2
    gap-4 my-6 justify-center md:mx-auto mx-4"
      >
        <section className="space-y-4 md:px-4">
          <h2 className="font-header text-2xl">Top Survey Responses</h2>
          <p>"{survey.text}"</p>
          <div className="flex justify-between w-full items-center my-1">
            {userVote}
            <Switch mode={displayPercent} setMode={setDisplayPercent} />
          </div>
          <Answers
            totalVotes={totalVotes}
            responses={topAnswers}
            score={score}
            displayPercent={displayPercent}
            category={loaderData.survey.category}
            highlights={highlights}
          />
        </section>
        <section className="space-y-4 md:px-4 md:col-start-1 md:row-start-1">
          <h2 className="font-header text-2xl">Survey Statistics</h2>
          <p>You scored better than {percentFormat(userRank)} of players!</p>
          <Histogram data={scoreData} userData={userScore} />
          <Scorebar {...scorebarProps} instructions={false} />
          <div className="flex flex-wrap space-x-3 my-3">
            <NavButton name="Respond" />
            <NavButton name="Draft" />
            <Link to="/surveys" className="underline inline-block self-end">
              More Surveys
            </Link>
          </div>
        </section>
      </main>
    </>
  );
};
