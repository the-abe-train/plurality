import type {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
  HtmlMetaDescriptor,
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

import { parseAnswer, trim } from "~/util/text";
import { client } from "~/db/connect.server";
import {
  addGuess,
  gameBySurveyUser,
  surveyByClose,
  surveyById,
  votesBySurvey,
} from "~/db/queries";
import { GameSchema, SurveySchema, VoteAggregation } from "~/db/schemas";
import { Photo } from "~/api/schemas";
import { commitSession, getSession } from "~/sessions";
import { fetchPhoto } from "~/api/unsplash";
import { MAX_GUESSES } from "~/util/constants";
import { exclamationIcon, guessIcon } from "~/images/icons";

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

type LoaderData = {
  game: GameSchema;
  message: string;
  gameOver: boolean;
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

  // Redirect not signed-in users to home page
  if (!userId) {
    // User can play exactly one game if they're not signed in.
    // Check if the player already has a game in the session
    if (session.has("game") && session.get("game") !== surveyId) {
      session.flash(
        "message",
        `You need to be logged-in to play more games.
        (You have already played Survey ${session.get("game")})`
      );
      return redirect("/user/login", {
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

  console.log("User ID", userId);

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

  // Game upsert
  const game = await gameBySurveyUser({
    client,
    surveyId,
    userId,
    totalVotes,
  });
  invariant(game, "Game upsert failed");

  // Set initial message for player
  const gameOver = game.guesses.length >= 6;
  let message = "";
  if (game.win && !gameOver) {
    message = "You win! Keep guessing to improve your score.";
  } else if (game.win && gameOver) {
    message = "You win! No more guesses.";
  } else if (!game.win && gameOver) {
    message = "No more guesses.";
  }

  const data = {
    totalVotes,
    game,
    tomorrow,
    message,
    gameOver,
    survey,
    photo,
    tomorrowPhoto,
  };
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

export const meta: MetaFunction = ({ data }: { data: LoaderData }) => {
  return {
    title: `Plurality #${data.survey._id}`,
    description: `Plurality #${data.survey._id}: ${data.survey.text}`,
  };
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
  const trimmedGuess = guess.trim().toLowerCase();

  // Reject already guessed answers
  if (game.guesses) {
    const alreadyGuessed = game.guesses.find((ans) => {
      const text = ans._id;
      return (
        trim(text) === trimmedGuess || parseAnswer(text).includes(trimmedGuess)
      );
    });
    if (alreadyGuessed) {
      const message = `"${alreadyGuessed._id}" was already guessed.`;
      return json<ActionData>({ message });
    }
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

  // Update game with new guess
  const guesses = [...game.guesses, correctGuess];
  const points = guesses.reduce((sum, guess) => {
    return sum + guess.votes;
  }, 0);
  const score = points / game.totalVotes;
  const win = score >= 80 / 100;
  const guessesToWin = win ? guesses.length : 0;
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
  return json<ActionData>({ message, correctGuess, win, gameOver });
};

export default () => {
  // Data from server
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  // console.log(loaderData.);

  // Initial states are from loader data
  const [guesses, setGuesses] = useState(loaderData.game.guesses || []);
  const [guess, setGuess] = useState("");
  const [gameOver, setGameOver] = useState(loaderData.gameOver);
  const [message, setMessage] = useState(loaderData.message);
  const [win, setWin] = useState(loaderData.game.win || false);
  const [displayPercent, setDisplayPercent] = useState(false);
  const { totalVotes } = loaderData;
  const userVote = loaderData.game.vote;

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

  // Updates from action data
  useEffect(() => {
    if (actionData?.correctGuess) {
      setGuesses([...guesses, actionData.correctGuess]);
      setGuess("");
    }
    setMessage(actionData?.message || message);
    setWin(actionData?.win || win);
    setGameOver(actionData?.gameOver || gameOver);
  }, [actionData]);

  // Upon winning, from action data or loader
  useEffect(() => {
    if (win && !openModal) {
      window.scrollTo(0, 0);
      setTimeout(() => {
        setOpenModal(true);
      }, 1500);
    }
  }, [win]);

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
  const scorebarProps = {
    points,
    score,
    guesses,
    win,
    surveyId: loaderData.survey._id,
    guessesToWin: loaderData.game.guessesToWin,
  };

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
          {message !== "" && <p className="">{message}</p>}
          <Form className="w-full flex space-x-2" method="post">
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
            <button
              className="silver px-3 py-1"
              disabled={gameOver}
              type="submit"
            >
              Enter
            </button>
          </Form>
        </section>
        <section className="space-y-4">
          <div className="flex justify-between w-full items-center">
            {userVote ? (
              <p>
                You responded <b>{userVote.text}</b> on{" "}
                <b>{dayjs(userVote.date).format("D MMMM YYYY")}</b>
              </p>
            ) : (
              <p>You did not respond to this Survey.</p>
            )}
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
        <section className="md:order-last md:self-end h-min">
          <Scorebar {...scorebarProps} instructions={true} />
        </section>
        <section className="md:self-end md:px-4">
          <div className="flex flex-wrap gap-3 my-3">
            <NavButton name="Respond" />
            <NavButton name="Draft" />
          </div>
          <Link to="/surveys" className="underline">
            Play more Surveys
          </Link>
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
