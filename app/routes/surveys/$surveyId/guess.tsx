import type {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  addGuess,
  gameBySurveyUser,
  surveyByClose,
  surveyById,
  surveyVotes,
} from "~/db/queries";
import { GameSchema, SurveySchema } from "~/db/schemas";
import { commitSession, getSession } from "~/sessions";
import { MAX_GUESSES, THRESHOLD } from "~/util/constants";
import { exclamationIcon, guessIcon } from "~/images/icons";
import { getLemma, surveyAnswers } from "~/util/nlp";
import { surveyMeta } from "~/routeApis/surveyMeta";
import { surveyCatch } from "~/routeApis/surveyCatch";

import Answers from "~/components/lists/Answers";
import Survey from "~/components/game/Survey";
import Scorebar from "~/components/game/Scorebar";
import Switch from "~/components/buttons/Switch";
import AnimatedBanner from "~/components/text/AnimatedBanner";
import NavButton from "~/components/buttons/NavButton";
import Modal from "~/components/modal/Modal";

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
  message: string;
  gameOver: boolean;
  survey: SurveySchema;
  totalVotes: number;
  tomorrow?: SurveySchema;
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

  // Get surveys
  let [survey, totalVotes, game] = await Promise.all([
    surveyById(client, surveyId),
    surveyVotes(client, surveyId),
    gameBySurveyUser({ client, surveyId, userId }),
  ]);
  if (!survey) {
    throw new Response("Survey has not been drafted yet.", {
      status: 404,
    });
  }
  invariant(game, "Game upsert failed");

  // Redirect to Respond if survey close hasn't happened yet
  const surveyClose = survey.surveyClose;
  if (dayjs(surveyClose) >= dayjs()) {
    return redirect(`/surveys/${surveyId}/respond`);
  }

  const gameOver = game.guesses.length >= MAX_GUESSES;

  // If the player has won, get tomorrow's survey for the preview
  if (game.win) {
    // Get tomorrow's survey from db
    const midnight = dayjs().tz("America/Toronto").endOf("day");
    const tomorrowSc = midnight.toDate();
    const tomorrow = await surveyByClose(client, tomorrowSc);
    invariant(tomorrow, "Tomorrow's survey not found.");
    const message = gameOver
      ? "You win! No more guesses."
      : "You win! Keep guessing to improve your score.";
    const data = {
      totalVotes,
      game,
      tomorrow,
      message,
      gameOver,
      survey,
    };
    return json<LoaderData>(data, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  // Set initial message for player
  const message = gameOver ? "No more guesses." : "";

  const data = {
    totalVotes,
    game,
    message,
    gameOver,
    survey,
  };
  return json<LoaderData>(data, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

type ActionData = {
  message: string;
};

export const action: ActionFunction = async ({ request, params }) => {
  // Async parse form and session data
  const [form, session] = await Promise.all([
    request.formData(),
    getSession(request.headers.get("Cookie")),
  ]);

  // Parse form
  const guess = form.get("guess") as string;

  // Reject empty form submissions
  if (!guess) {
    const message = "Please enter a guess.";
    return json<ActionData>({ message });
  }

  // Pull in relevant data
  const userId = session.get("user");
  const surveyId = Number(params.surveyId);
  const game = await gameBySurveyUser({
    client,
    surveyId,
    userId,
  });
  invariant(game, "Game upsert failed");
  const lemmaGuess = getLemma(guess);

  // Reject already guessed answers
  const guessesArray = game.guesses;
  if (game.guesses) {
    const alreadyGuessed = guessesArray.find((ans) => ans._id === lemmaGuess);
    if (alreadyGuessed) {
      const message = `"${alreadyGuessed._id}" was already guessed.`;
      return json<ActionData>({ message });
    }
  }

  // Compare guess against actual survey responses
  const answers = await surveyAnswers(client, surveyId);
  const totalVotes = answers.reduce((sum, ans) => {
    return sum + ans.votes;
  }, 0);
  const correctGuess = answers.find((ans) => ans._id === lemmaGuess);

  // Reject incorrect guesses
  if (!correctGuess) {
    const message = `"${guess}" was not a survey response.`;
    return json<ActionData>({ message });
  }

  // Update game with new guess
  const guesses = [...game.guesses, correctGuess];
  const points = guesses.reduce((sum, guess) => sum + guess.votes, 0);
  const score = points / totalVotes;
  const win = score >= THRESHOLD / 100;
  const guessesToWin = win ? guesses.length : MAX_GUESSES;
  const updatedGame = await addGuess(
    client,
    game._id,
    correctGuess,
    win,
    score,
    guessesToWin
  );
  invariant(updatedGame, "Game update failed");

  // Pick message to send to player
  const gameOver = updatedGame.guesses.length >= MAX_GUESSES;
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
  return json<ActionData>({
    message,
  });
};

export default () => {
  // Data from server
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  // Initial states are from loader data
  const [guesses, setGuesses] = useState(loaderData.game.guesses);
  const [guess, setGuess] = useState("");
  const [gameOver, setGameOver] = useState(loaderData.gameOver);
  const [message, setMessage] = useState(loaderData.message);
  const [win, setWin] = useState(loaderData.game.win || false);
  const [displayPercent, setDisplayPercent] = useState(false);
  const [guessesToWin, setGuessesToWin] = useState(
    loaderData.game.guessesToWin || loaderData.game.guesses.length
  );
  const { totalVotes } = loaderData;

  // Displaying to the user what they voted
  const userVote = useMemo(() => {
    const rawUserVote = loaderData.game.vote?.text;
    const voteDate = loaderData.game.vote?.date;
    const surveyCloseDate = loaderData.survey.surveyClose;
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
  }, [loaderData.game, loaderData.survey]);

  // Ensure state changes when the Survey number changes
  useEffect(() => {
    setGuesses(loaderData.game.guesses);
    setWin(loaderData.game.win || win);
    setGuessesToWin(loaderData.game.guessesToWin || guessesToWin);
    setGameOver(loaderData.gameOver || gameOver);
  }, [loaderData.game, loaderData.gameOver]);

  // Unsplash photo attributions
  const unsplashLink = "https://unsplash.com/photos/" + loaderData.survey.photo;

  // The modal
  const [openModal, setOpenModal] = useState(loaderData.game.win || win);
  const mainRef = useRef<HTMLDivElement>(null!);
  useEffect(() => {
    if (openModal) {
      disableBodyScroll(mainRef.current);
    } else {
      enableBodyScroll(mainRef.current);
    }
    return () => clearAllBodyScrollLocks();
  }, [mainRef, openModal]);

  // Updates from action data
  useEffect(() => {
    setMessage(actionData?.message || message);
  }, [loaderData, actionData]);

  // Upon winning, from action data or loader
  useEffect(() => {
    if (win && !openModal) {
      setTimeout(() => {
        setOpenModal(true);
      }, 1500);
    }
  }, [win]);

  // Always scroll to the top when opening modal
  useEffect(() => {
    if (openModal) {
      window.scrollTo(0, 0);
    }
  }, [openModal]);

  // Calculated values
  const points = guesses.reduce((sum, guess) => {
    return sum + guess.votes;
  }, 0);
  const score = points / totalVotes;
  const surveyProps = { survey: loaderData.survey };
  const tomorrowSurveyProps = loaderData.tomorrow;
  const scorebarProps = {
    points,
    score,
    guesses,
    win,
    surveyId: loaderData.survey._id,
    guessesToWin,
  };

  // Clearing the form after submission
  const formRef = useRef<HTMLFormElement>(null!);
  const inputRef = useRef<HTMLInputElement>(null!);
  const transition = useTransition();
  const submitting = transition.state === "submitting";
  useEffect(() => {
    if (!submitting) {
      setGuess("");
      formRef.current.reset();
      inputRef.current.focus();
    }
  }, [submitting]);

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
          {message !== "" && <p data-cy="message">{message}</p>}
          <Form className="w-full flex space-x-2" method="post" ref={formRef}>
            <input
              className="border border-outline py-1 px-2 
              bg-white disabled:bg-gray-300 w-full"
              type="text"
              name="guess"
              placeholder="Guess survey responses"
              value={guess}
              disabled={gameOver}
              data-cy="guess-input"
              onChange={(e) => setGuess(e.target.value)}
              ref={inputRef}
              required
            />
            <button
              className="silver px-3 py-1"
              data-cy="guess-enter"
              disabled={gameOver}
              type="submit"
            >
              Enter
            </button>
          </Form>
        </section>
        <section className="space-y-4 md:px-4">
          <div className="flex justify-between w-full items-center my-1">
            {userVote}
            <Switch mode={displayPercent} setMode={setDisplayPercent} />
          </div>
          <Answers
            totalVotes={totalVotes}
            guesses={guesses}
            score={score}
            displayPercent={displayPercent}
            category={loaderData.survey.category}
          />
        </section>
        <section className="md:order-last md:self-end h-min md:px-4">
          <Scorebar {...scorebarProps} instructions={true} />
        </section>
        <section className="md:self-end md:px-4">
          <div className="flex flex-wrap space-x-3 my-3">
            <NavButton name="Respond" />
            <NavButton name="Draft" />
            <Link to="/surveys" className="underline inline-block self-end">
              More Surveys
            </Link>
          </div>
          <p className="text-sm my-2 italic">
            Survey photo from{" "}
            <a className="underline" href={unsplashLink}>
              Unsplash
            </a>
          </p>
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
