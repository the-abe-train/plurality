import type {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  clearAllBodyScrollLocks,
  disableBodyScroll,
  enableBodyScroll,
} from "body-scroll-lock";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";

import { client } from "~/db/connect.server";
import { surveyByClose, surveyById } from "~/db/queries";
import { GameSchema, RankedVote, SurveySchema } from "~/db/schemas";
import { commitSession, getSession } from "~/sessions";
import { exclamationIcon, guessIcon } from "~/images/icons";
import { surveyCatch } from "~/routeApis/surveyCatch";

import Answers from "~/components/lists/Answers";
import Survey from "~/components/game/Survey";
import Scorebar from "~/components/game/Scorebar";
import Switch from "~/components/buttons/Switch";
import AnimatedBanner from "~/components/text/AnimatedBanner";
import Modal from "~/components/modal/Modal";
import MiniNav from "~/components/navigation/MiniNav";

import {
  calcMaxGuesses,
  checkWin,
  getTotalVotes,
  revealResults,
} from "~/util/gameplay";
import { getLemma, surveyAnswers } from "~/util/nlp";
import { surveyMeta } from "~/routeApis/surveyMeta";
import useValidation from "~/hooks/useValidation";
import { isMobile } from "react-device-detect";

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
  survey: SurveySchema;
  totalVotes: number;

  maxGuesses: number;

  tomorrow?: SurveySchema;
};

export const loader: LoaderFunction = async ({ params, request }) => {
  // Get user info
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user");
  const surveyId = Number(params.surveyId);

  // Redirect users who are signed-in to regular page
  if (userId) {
    return redirect(`/surveys/${surveyId}/guess`);
  }

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

  // Tomorrow's survey
  const midnight = dayjs().tz("America/Toronto").endOf("day");
  const tomorrowSc = midnight.toDate();

  // Set the sample game for this not-logged-in user
  session.set("game", surveyId);

  // Get surveys
  let [survey, answers, tomorrow] = await Promise.all([
    surveyById(client, surveyId),
    surveyAnswers(client, surveyId),
    surveyByClose(client, tomorrowSc),
  ]);
  if (!survey) {
    throw new Response("Survey has not been drafted yet.", {
      status: 404,
    });
  }

  const totalVotes = getTotalVotes(answers);
  const maxGuesses = calcMaxGuesses(answers);

  // IN THIS BRANCH, NEVER REDIRECT TO RESPOND
  // Redirect to Respond if survey close hasn't happened yet
  const surveyClose = survey.surveyClose;
  if (dayjs(surveyClose) >= dayjs()) {
    return redirect(`/surveys/${surveyId}/respond`);
  }

  invariant(tomorrow, "Tomorrow's survey not found.");
  const data = { survey, totalVotes, tomorrow, maxGuesses };

  return json<LoaderData>(data, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

type ActionData = {
  message: string;
  correctGuess?: RankedVote;
  gameOver?: boolean;
  win?: boolean;
};

export const action: ActionFunction = async ({ request, params }) => {
  // Parse form
  const form = await request.formData();
  const guess = form.get("guess") as string;
  const guesses = form.get("guesses") as string;
  const totalVotes = Number(form.get("totalVotes") as string);

  // Reject empty form submissions
  if (!guess) {
    const message = "Please enter a guess.";
    return json<ActionData>({ message });
  }

  // Pull in relevant data
  const surveyId = Number(params.surveyId);
  const lemmaGuess = getLemma(guess);

  // Reject already guessed answers
  const guessesArray: RankedVote[] = JSON.parse(guesses);
  const alreadyGuessed = guessesArray.find((ans) => ans._id === lemmaGuess);
  if (alreadyGuessed) {
    const message = `"${alreadyGuessed._id}" was already guessed.`;
    return json<ActionData>({ message });
  }

  // Compare guess against actual survey responses
  const answers = await surveyAnswers(client, surveyId);
  const correctGuess = answers.find((ans) => ans._id === lemmaGuess);
  const maxGuesses = calcMaxGuesses(answers);

  // Reject incorrect guesses
  if (!correctGuess) {
    const message = `"${guess}" was not a survey response.`;
    return json<ActionData>({ message });
  }

  // Calculated values
  const points = getTotalVotes(guessesArray);
  const score = points / totalVotes;

  // Update guesses and win status
  const updatedGuesses = [...guessesArray, correctGuess];
  const win = checkWin(updatedGuesses, totalVotes);

  // Pick message to send to player
  const gameOver = updatedGuesses.length >= maxGuesses || score === 1;
  let message: string;
  if (win) {
    message = "You win!";
  } else if (!win && gameOver) {
    message = "No more guesses.";
  } else {
    message = "Great guess!";
  }
  return json<ActionData>({ message, correctGuess, win, gameOver });
};

export default () => {
  // Data from server
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const { totalVotes, maxGuesses, survey, tomorrow } = loaderData;
  const surveyId = survey._id;

  // Initial states are from loader data
  const [guesses, setGuesses] = useState<RankedVote[]>([]);
  const [guess, setGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [msg, setMsg] = useState(
    "Try to guess the most popular survey responses!"
  );
  const [win, setWin] = useState(false);
  const [guessesToWin, setGuessesToWin] = useState(0);
  const [displayPercent, setDisplayPercent] = useState(false);

  // Calculated values
  const points = getTotalVotes(guesses);
  const score = points / totalVotes;

  // Guess validation
  const [enabled, setEnabled] = useState(true);
  const [msgColour, setMsgColour] = useState("inherit");
  useValidation({
    voteText: guess,
    category: survey.category,
    setEnabled,
    setMsgColour,
    setMsg,
  });

  // Initial game data to local storage
  // Local storage code needs to be run in useEffect or else the server will
  // try to run it.
  useEffect(() => {
    // If another survey's answers are stored in localstorage, start fresh
    const storedSurvey = Number(localStorage.getItem("survey"));
    if (storedSurvey && storedSurvey !== surveyId) {
      localStorage.setItem("guesses", "[]");
      localStorage.setItem("win", "false");
      localStorage.setItem("gameOver", "false");
      localStorage.setItem("guessesToWin", "0");

      // Set state initial values from local storage
    } else if (storedSurvey && storedSurvey === surveyId) {
      setGuesses(JSON.parse(localStorage.getItem("guesses") || "[]"));
      setWin(JSON.parse(localStorage.getItem("win") || "false"));
      setGameOver(JSON.parse(localStorage.getItem("gameOver") || "false"));
      setGuessesToWin(JSON.parse(localStorage.getItem("guessesToWin") || "0"));

      // If it's the first time you've done a sample survey, set blank data
    } else {
      localStorage.setItem("survey", `${surveyId}`);
      localStorage.setItem("guesses", "[]");
      localStorage.setItem("win", "false");
      localStorage.setItem("gameOver", "false");
      localStorage.setItem("guessesToWin", "0");
    }
  }, []);

  // Updates from action data
  useEffect(() => {
    if (actionData) {
      if (actionData.correctGuess) {
        setGuesses([...guesses, actionData.correctGuess]);
        setGuess("");
      }
      setMsg(actionData.message);
      setMsgColour("inherit");
      setWin(actionData?.win || win);
      setGameOver(actionData?.gameOver || gameOver);
    }
  }, [actionData]);

  // New guesses
  useEffect(() => {
    localStorage.setItem("guesses", JSON.stringify(guesses));
    localStorage.setItem("gameOver", JSON.stringify(gameOver));
  }, [guesses, gameOver]);

  // The modal
  const [openModal, setOpenModal] = useState(actionData?.win || win);
  const mainRef = useRef<HTMLDivElement>(null!);
  useEffect(() => {
    if (openModal) {
      disableBodyScroll(mainRef.current);
    } else {
      enableBodyScroll(mainRef.current);
    }
    return () => clearAllBodyScrollLocks();
  }, [mainRef, openModal]);

  // Upon winning
  useEffect(() => {
    localStorage.setItem("win", JSON.stringify(win));
    const gameStateChange = win || gameOver;
    if (gameStateChange && !openModal) {
      setTimeout(() => {
        setOpenModal(true);
      }, 1500);
      if (localStorage.getItem("guessesToWin") === "0") {
        localStorage.setItem("guessesToWin", JSON.stringify(guesses.length));
        setGuessesToWin(guesses.length);
      }
    }
  }, [win, gameOver]);

  // Always scroll to the top when opening modal
  useEffect(() => {
    if (openModal) {
      window.scrollTo(0, 0);
    }
  }, [openModal]);

  // When to reveal answers
  const mockGame = {
    survey: surveyId,
    win,
    guesses,
  } as GameSchema;

  const scorebarProps = {
    points,
    score,
    guesses,
    win,
    gameOver,
    surveyId,
    guessesToWin,
    maxGuesses,
  };

  // Clearing the form after submission
  const formRef = useRef<HTMLFormElement>(null!);
  const inputRef = useRef<HTMLInputElement>(null!);
  useEffect(() => {
    if (!!actionData?.correctGuess && isMobile) {
      setGuess("");
      formRef.current.reset();
      inputRef.current.blur();
    }
  }, [actionData?.correctGuess]);

  return (
    <>
      {!win && <AnimatedBanner text="Guess" icon={guessIcon} />}
      {win && <AnimatedBanner text="Winner" icon={exclamationIcon} />}
      <main
        className="max-w-4xl flex-grow flex flex-col md:grid grid-cols-2
        gap-4 my-6 justify-center md:mx-auto mx-4"
        ref={mainRef}
      >
        <section
          className="md:px-4 space-y-4 w-full md:w-fit md:mx-0 
        justify-self-start"
        >
          <Survey survey={survey} />
          <p
            className="w-full md:max-w-survey"
            data-cy="message"
            style={{ color: msgColour }}
          >
            {msg}{" "}
            {revealResults(mockGame, maxGuesses) && (
              <Link
                to={`/surveys/${survey._id}/results`}
                className="underline"
                data-cy="results-link"
              >
                Click to see top responses.
              </Link>
            )}
          </p>
          <Form
            className="md:w-survey mx-auto flex space-x-2"
            method="post"
            ref={formRef}
          >
            <input
              className="border border-outline py-1 px-2 
              bg-white disabled:bg-gray-300 w-full"
              type="text"
              name="guess"
              placeholder="Guess survey responses"
              value={guess}
              disabled={gameOver}
              onChange={(e) => setGuess(e.target.value)}
              ref={inputRef}
              data-cy="guess-input"
              required
            />
            <input
              className="hidden"
              type="text"
              name="guesses"
              value={JSON.stringify(guesses)}
              readOnly
            />
            <input
              className="hidden"
              type="text"
              name="totalVotes"
              value={JSON.stringify(totalVotes)}
              readOnly
            />
            <button
              className="silver px-3 py-1"
              disabled={gameOver || !enabled}
              type="submit"
            >
              Enter
            </button>
          </Form>
        </section>
        <section className="space-y-4 md:px-4">
          <div className="flex justify-between w-full items-center">
            <p>
              Survey closed on {dayjs(survey.surveyClose).format("D MMMM YYYY")}
              .
            </p>
            <Switch mode={displayPercent} setMode={setDisplayPercent} />
          </div>
          <Answers
            totalVotes={totalVotes}
            responses={guesses}
            displayPercent={displayPercent}
            category={survey.category}
          />
        </section>
        <section className="md:order-last md:self-end h-min md:px-4">
          <Scorebar {...scorebarProps} instructions />
        </section>
        <section className="md:self-end md:px-4">
          {survey._id <= 8 && (
            <p className="my-2 ">
              Survey #{survey._id} is a{" "}
              <Link
                to="/help/terminology"
                className="underline"
                data-cy="help-link"
              >
                practice Survey.
              </Link>
            </p>
          )}

          <MiniNav survey={survey} page="guess" />
        </section>
      </main>
      <AnimatePresence initial={true} exitBeforeEnter={true}>
        {openModal && (
          <Modal
            scorebarProps={scorebarProps}
            survey={tomorrow}
            handleClose={() => setOpenModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
