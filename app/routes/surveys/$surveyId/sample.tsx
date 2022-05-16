import type {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
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

import { parseAnswer, trim } from "~/util/text";
import { client } from "~/db/connect.server";
import { surveyByClose, surveyById, votesBySurvey } from "~/db/queries";
import { SurveySchema, VoteAggregation } from "~/db/schemas";
import { Photo } from "~/api/schemas";
import { commitSession, getSession } from "~/sessions";
import { fetchPhoto } from "~/api/unsplash";
import { exclamationIcon, guessIcon } from "~/images/icons";

import Answers from "~/components/lists/Answers";
import Survey from "~/components/game/Survey";
import Scorebar from "~/components/game/Scorebar";
import Switch from "~/components/buttons/Switch";
import AnimatedBanner from "~/components/text/AnimatedBanner";
import NavButton from "~/components/buttons/NavButton";
import Modal from "~/components/modal/Modal";
import { THRESHOLD } from "~/util/constants";
import { checkWin } from "~/util/gameplay";

dayjs.extend(utc);
dayjs.extend(timezone);

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: backgrounds },
  ];
};

type LoaderData = {
  survey: SurveySchema;
  photo: Photo;
  totalVotes: number;
  tomorrow: SurveySchema;
  tomorrowPhoto: Photo;
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
      `You need to be logged-in to play more games.
        (You have already played Question ${session.get("game")})`
    );
    return redirect("/user/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  // Set the sample game for this not-logged-in user
  session.set("game", surveyId);

  // Get tomorrow's survey from db
  const midnight = dayjs().tz("America/Toronto").endOf("day");
  const tomorrowSc = midnight.toDate();

  // Get surveys
  const [survey, tomorrow] = await Promise.all([
    surveyById(client, surveyId),
    surveyByClose(client, tomorrowSc),
  ]);
  invariant(survey, "No survey found!");
  invariant(tomorrow, "Tomorrow's survey not found!");

  // Redirect to Respond if survey close hasn't happened yet
  const surveyClose = survey.surveyClose;
  if (dayjs(surveyClose) >= dayjs()) {
    return redirect(`/surveys/${surveyId}/respond`);
  }

  // Get additional surveydata from db and apis
  const [photo, votes, tomorrowPhoto] = await Promise.all([
    fetchPhoto(survey.photo),
    votesBySurvey(client, surveyId),
    fetchPhoto(tomorrow.photo),
  ]);

  console.log("Votes", votes);
  const totalVotes = votes.reduce((sum, ans) => {
    return sum + ans.votes;
  }, 0);

  const data = { survey, photo, totalVotes, tomorrow, tomorrowPhoto };
  return json<LoaderData>(data, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

type ActionData = {
  message: string;
  correctGuess?: VoteAggregation;
  gameOver?: boolean;
  win?: boolean;
};

export const action: ActionFunction = async ({ request, params }) => {
  // Parse form
  const form = await request.formData();
  const guess = form.get("guess") as string;
  const guesses = form.get("guesses") as string;
  const totalVotes = form.get("totalVotes") as string;

  // Reject empty form submissions
  if (!guess) {
    const message = "Please enter a guess.";
    return json<ActionData>({ message });
  }

  // Pull in relevant data
  const surveyId = Number(params.surveyId);
  const trimmedGuess = guess.trim().toLowerCase();

  // Reject already guessed answers
  const guessesArray: VoteAggregation[] = JSON.parse(guesses);
  const alreadyGuessed = guessesArray.find((ans) => {
    const text = ans._id;
    return (
      trim(text) === trimmedGuess || parseAnswer(text).includes(trimmedGuess)
    );
  });
  if (alreadyGuessed) {
    const message = `"${alreadyGuessed._id}" was already guessed.`;
    return json<ActionData>({ message });
  }

  // Pull in more relevant data
  const answers = await votesBySurvey(client, surveyId);
  const correctGuess = answers.find((ans) => {
    const text = ans._id;
    return (
      trim(text) === trimmedGuess || parseAnswer(text).includes(trimmedGuess)
    );
  });

  // Reject incorrect guesses
  if (!correctGuess) {
    const message = `"${guess}" was not a survey response.`;
    return json<ActionData>({ message });
  }

  // Update guesses and win status
  const updatedGuesses = [...guessesArray, correctGuess];
  const win = checkWin(updatedGuesses, Number(totalVotes));

  // Pick message to send to player
  const gameOver = updatedGuesses.length >= THRESHOLD;
  let message: string;
  if (win && !gameOver) {
    message = "You win! Keep guessing to improve your score.";
  } else if (win && gameOver) {
    message = "You win! No more guesses.";
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

  // Initial states are from loader data
  const [guesses, setGuesses] = useState<VoteAggregation[]>([]);
  const [guess, setGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [win, setWin] = useState(false);
  const [displayPercent, setDisplayPercent] = useState(false);
  const { totalVotes } = loaderData;
  const surveyId = loaderData.survey._id;

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

  // Initial game data to local storage
  // Local storage code needs to be run in useEffect or else the server will
  // try to run it.
  useEffect(() => {
    // If another survey's answers are stored in localstorage, start fresh
    const storedQuestion = Number(localStorage.getItem("survey"));
    if (storedQuestion && storedQuestion !== surveyId) {
      localStorage.setItem("guesses", "[]");
      localStorage.setItem("win", "false");
      localStorage.setItem("gameOver", "false");
    }
    localStorage.setItem("survey", `${surveyId}`);

    // Set state initial values from local storage
    setGuesses(JSON.parse(localStorage.getItem("guesses") || "[]"));
    setWin(JSON.parse(localStorage.getItem("win") || "false"));
    setGameOver(JSON.parse(localStorage.getItem("gameOver") || "false"));
  }, []);

  // Updates from action data
  useEffect(() => {
    if (actionData) {
      if (actionData.correctGuess) {
        setGuesses([...guesses, actionData.correctGuess]);
        setGuess("");
      }
      setMessage(actionData.message);
      setWin(actionData?.win || win);
      setGameOver(actionData?.gameOver || gameOver);
    }
  }, [actionData]);

  // Update the local storage and win condition
  useEffect(() => {
    localStorage.setItem("guesses", JSON.stringify(guesses));
    localStorage.setItem("win", JSON.stringify(win));
    localStorage.setItem("gameOver", JSON.stringify(gameOver));
    if (win) {
      window.scrollTo(0, 0);
      setOpenModal(true);
    }
  }, [guesses, win, gameOver]);

  // Always scroll to the top on refresh
  useEffect(() => window.scrollTo(0, 0), []);

  // Calculated values
  const points = guesses.reduce((sum, guess) => {
    return sum + guess.votes;
  }, 0);
  const score = points / totalVotes;
  const surveyProps = { survey: loaderData.survey, photo: loaderData.photo };
  const tomorrowSurveyProps = {
    survey: loaderData.tomorrow,
    photo: loaderData.tomorrowPhoto,
  };
  const scorebarProps = { points, score, guesses, win };

  return (
    <>
      {!win && <AnimatedBanner text="Guess" icon={guessIcon} />}
      {win && <AnimatedBanner text="Winner" icon={exclamationIcon} />}
      <main
        className="max-w-4xl flex-grow flex flex-col md:grid grid-cols-2
        gap-4 my-6 justify-center md:mx-auto mx-4"
        ref={mainRef}
      >
        <section className="md:px-4 space-y-4 mx-auto md:mx-0 justify-self-start">
          <Survey {...surveyProps} />

          <p>{gameOver}</p>
          <Form className="w-survey mx-auto flex space-x-2" method="post">
            <input
              className="border border-outline py-1 px-2 
              bg-white disabled:bg-gray-300 w-full"
              type="text"
              name="guess"
              placeholder="Guess survey responses"
              value={guess}
              disabled={gameOver}
              onChange={(e) => setGuess(e.target.value)}
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
              disabled={gameOver}
              type="submit"
            >
              Enter
            </button>
          </Form>
          {message !== "" && <p>{message}</p>}
        </section>
        <section className="space-y-4">
          <div className="flex justify-between w-full items-center">
            <p>You did not respond to this Survey.</p>
            <Switch mode={displayPercent} setMode={setDisplayPercent} />
          </div>
          <Answers
            totalVotes={totalVotes}
            guesses={guesses}
            score={score}
            displayPercent={displayPercent}
          />
        </section>
        <section className="md:order-last">
          <Scorebar
            points={points}
            score={score}
            guesses={guesses}
            win={win}
            instructions
          />
        </section>
        <section className="md:self-end md:px-4 flex space-x-4">
          <NavButton name="Guess" />
          <NavButton name="Respond" />
          <NavButton name="Draft" />
        </section>
      </main>
      <AnimatePresence initial={true} exitBeforeEnter={true}>
        {openModal && (
          <Modal
            scorebarProps={scorebarProps}
            surveyProps={tomorrowSurveyProps}
            handleClose={() => setOpenModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
