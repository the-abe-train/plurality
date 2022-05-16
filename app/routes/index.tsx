import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderFunction, LinksFunction } from "@remix-run/node";

import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";

import { SurveySchema } from "~/db/schemas";
import { surveyByClose } from "~/db/queries";
import { client } from "~/db/connect.server";
import { Photo } from "~/api/schemas";
import { fetchPhoto } from "~/api/unsplash";

import AnimatedBanner from "~/components/text/AnimatedBanner";
import Survey from "~/components/game/Survey";
import NavButton from "~/components/buttons/NavButton";

import logo from "~/images/icons/logo.svg";
import guess from "~/images/icons/guess.svg";
import respond from "~/images/icons/respond.svg";
import draft from "~/images/icons/draft.svg";

import invariant from "tiny-invariant";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

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
};

export const loader: LoaderFunction = async ({ request }) => {
  const midnight = dayjs().tz("America/Toronto").endOf("day");
  const surveyClose = midnight.subtract(1, "day").toDate();
  const survey = await surveyByClose(client, surveyClose);
  invariant(survey, "Tomorrow's survey not found!");
  const photo = await fetchPhoto(survey.photo);
  const data = { survey, photo };
  return json<LoaderData>(data);
};

const instructions = [
  {
    name: "Guess",
    icon: guess,
    link: "/surveys/today",
    text: (
      <>
        <b>Guess</b> the most popular answers to surveys.
      </>
    ),
  },
  {
    name: "Respond",
    icon: respond,
    link: "/surveys/tomorrow",
    text: (
      <>
        <b>Respond</b> to survey questions for future games.
      </>
    ),
  },
  {
    name: "Draft",
    icon: draft,
    link: "/draft",
    text: (
      <>
        <b>Draft</b> custom questions for future surveys.
      </>
    ),
  },
];

export default function questions() {
  const data = useLoaderData<LoaderData>();
  return (
    <div className="light w-full top-0 bottom-0 flex flex-col min-h-screen">
      <div
        className="md:absolute top-1/2 left-1/2 md:w-max md:mx-4
        md:transform md:-translate-x-1/2 md:-translate-y-1/2
        max-w-survey md:max-w-4xl mx-auto"
      >
        <AnimatedBanner text="Plurality" icon={logo} size={"50"} />
        <p className="text-center text-lg">A Web3 guessing game.</p>
        <div className="md:grid grid-cols-2 gap-y-3 gap-x-8 my-6">
          <h2 className="block text-2xl font-header row-start-1 col-start-2 mt-6 mb-2 md:my-0">
            Click on today's Survey to begin!
          </h2>
          <div className="col-start-2">
            <Survey photo={data.photo} survey={data.survey} />
          </div>
          <div className="my-5 md:my-0">
            <div className="flex flex-wrap gap-3 my-3 md:mt-1 md:mb-2">
              <NavButton name="Respond" />
              <NavButton name="Draft" />
            </div>
            <Link to="/surveys" className="underline text-right w-full md:my-2">
              Play more Surveys
            </Link>
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
                        className="block"
                      />
                    </Link>
                    <p className="block text-black">{instr.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="my-2 md:my-0 col-start-1 row-start-3">
            <Link to="/help/what-is-plurality" className="underline">
              What is Plurality?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
