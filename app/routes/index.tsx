import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderFunction, LinksFunction } from "@remix-run/node";
import invariant from "tiny-invariant";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";

import { surveyByClose } from "~/db/queries";
import { client } from "~/db/connect.server";

import AnimatedBanner from "~/components/text/AnimatedBanner";
import Survey from "~/components/game/Survey";

import { draftIcon, guessIcon, logo, respondIcon } from "~/images/icons";
import Footer from "~/components/navigation/Footer";

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
};

export const loader: LoaderFunction = async () => {
  const midnight = dayjs().tz("America/Toronto").endOf("day");
  const surveyClose = midnight.subtract(1, "day").toDate();
  const survey = await surveyByClose(client, surveyClose);
  invariant(survey, "Tomorrow's survey not found!");
  const data = { survey };
  return json<LoaderData>(data);
};

const instructions = [
  {
    name: "Guess",
    icon: guessIcon,
    link: "/surveys/today",
    text: (
      <>
        <b>Guess</b> the most popular answers to surveys.
      </>
    ),
  },
  {
    name: "Respond",
    icon: respondIcon,
    link: "/surveys/tomorrow",
    text: (
      <>
        <b>Respond</b> to survey questions for future games.
      </>
    ),
  },
  {
    name: "Draft",
    icon: draftIcon,
    link: "/draft",
    text: (
      <>
        <b>Draft</b> custom questions for future surveys.
      </>
    ),
  },
];

export default () => {
  const data = useLoaderData<LoaderData>();
  return (
    <div
      className="light w-full top-0 bottom-0 flex flex-col justify-between min-h-screen 
    h-full"
    >
      <div className="md:w-max mx-auto md:pb-8 max-w-survey md:max-w-4xl md:min-h-screen py-8">
        <AnimatedBanner text="Plurality" icon={logo} size={50} />
        <div className="my-6 space-y-4">
          <h2 className="text-2xl font-header text-center">
            A Message from Trainwreck Labs
          </h2>
          <p>
            I am sad to announce that there will be no more new surveys added to
            Plurality for the foreseeable future.
          </p>
          <p>
            Plurality started off as an experiment to understand the diversity
            of opinions of random internet strangers, but instead became an
            illustration of how much we all have in common. I am extremely
            grateful to the people who responded to this game's hundreds of
            surveys, shared their scores, and hopefully learned something every
            now and then.
          </p>
          <p>
            Old surveys will remain up indefinitely, but if you want to continue
            enjoying new daily challenges, make sure to checkout other games
            from{" "}
            <a href="https://trainwrecklabs.com" className="underline">
              Trainwreck Labs
            </a>
            !
          </p>
          <p>
            Although there are no current plans to upload new surveys, Plurality
            may eventually return. If that happens, the first place you'll hear
            about it is on the official Trainwreck Labs{" "}
            <a href="https://discord.gg/Xpyy8dCr9g" className="underline">
              Discord server
            </a>
            . Make sure to join and be on the lookout for updates!
          </p>
          <p>With gratitude,</p>
          <p>The Abe Train</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};
