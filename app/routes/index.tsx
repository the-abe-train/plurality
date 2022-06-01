import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderFunction, LinksFunction } from "@remix-run/node";
import invariant from "tiny-invariant";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";

import { SurveySchema } from "~/db/schemas";
import { surveyByClose } from "~/db/queries";
import { client } from "~/db/connect.server";

import AnimatedBanner from "~/components/text/AnimatedBanner";
import Survey from "~/components/game/Survey";

import { draftIcon, guessIcon, logo, respondIcon } from "~/images/icons";

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

export const loader: LoaderFunction = async ({ request }) => {
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
    <div className="light w-full top-0 bottom-0 flex flex-col min-h-screen">
      <div
        className="md:absolute top-1/2 left-1/2 md:w-max
        md:transform md:-translate-x-1/2 md:-translate-y-1/2
        max-w-survey md:max-w-4xl mx-auto md:pb-8"
      >
        <AnimatedBanner text="Plurality" icon={logo} size={50} />
        <p className="text-center text-lg">A Web3 guessing game.</p>
        <div className="md:grid grid-cols-2 gap-y-3 gap-x-8 my-6">
          <h2 className="block text-2xl font-header row-start-1 col-start-2 mt-6 mb-2 md:my-0">
            Click on today's Survey to begin!
          </h2>
          <div className="col-start-2">
            <Survey survey={data.survey} />
          </div>
          <h2 className="text-2xl font-header row-start-1 mt-6 mb-2 md:my-0 col-start-1">
            Instructions
          </h2>
          <div
            className="col-start-1 row-start-2 flex justify-around card 
            flex-col max-w-survey min-w-[260px] p-3 h-full
            "
          >
            {instructions.map((instr) => {
              return (
                <div key={instr.name} className="flex flex-col items-center">
                  <div className="flex items-center p-2 space-x-3">
                    <Link to={instr.link} className="cursor-default h-max">
                      <img
                        src={instr.icon}
                        alt={instr.name}
                        width={44}
                        height={44}
                        className="block"
                      />
                    </Link>
                    <p className="block text-black">{instr.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
