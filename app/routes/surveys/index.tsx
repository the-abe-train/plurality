import { useRef } from "react";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

import { Form, useLoaderData, useTransition } from "@remix-run/react";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";

import { SurveySchema } from "~/db/schemas";
import { getAllSurveyIds, surveyBySearch, votesBySurvey } from "~/db/queries";
import { client } from "~/db/connect.server";

import { PER_PAGE } from "~/util/gameplay";

import Survey from "~/components/game/Survey";
import AnimatedBanner from "~/components/text/AnimatedBanner";

import { emptyLogo } from "~/images/icons";

dayjs.extend(utc);
dayjs.extend(timezone);

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: backgrounds },
  ];
};

type LoaderData = {
  firstSurvey: string;
  lastSurvey: string;
  pageSurveys: SurveySchema[];
  metadata: {
    pageStart: number;
    pageEnd: number;
    totalSurveysNum: number;
    pageSurveysNum: number;
    newPage: number;
  };
  message: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  const surveys = await getAllSurveyIds(client);
  const formatDate = (date: Date) =>
    dayjs(date).tz("America/Toronto").format("YYYY-MM-DD");
  const firstSurvey = formatDate(surveys[0]);
  const lastSurvey = formatDate(surveys[surveys.length - 1]);
  const firstAndLast = { firstSurvey, lastSurvey };

  // Parse form
  const url = new URL(request.url);
  const search = new URLSearchParams(url.search);
  const textParam = search.get("text");
  const dateParam = search.get("date");
  const pageParam = search.get("page");

  // Values show up as "on" or null
  const communityParam = search.get("community");
  const standardParam = search.get("standard");

  let dateSearch = new Date();
  if (dateParam) {
    const [year, month, day] = dateParam.split("-").map((str) => Number(str));
    dateSearch = new Date(Date.UTC(year, month - 1, day + 1, 3, 59, 59, 999));
  }

  // // Create regex from text search input
  let textSearch = /.+/;
  let idSearch = NaN;
  if (Number(textParam)) {
    textSearch = /^\S+$/;
    idSearch = Number(textParam);
  } else if (textParam) {
    try {
      textSearch = new RegExp(String.raw`${textParam}`, "gi");
    } catch (e) {
      const metadata = {
        pageStart: 0,
        pageEnd: 0,
        totalSurveysNum: 0,
        pageSurveysNum: 0,
        newPage: 1,
      };
      const message = "Text input cannot contain symbols.";
      const data = {
        pageSurveys: [],
        metadata,
        message,
        ...firstAndLast,
      };
      return json<LoaderData>(data);
    }
  }

  // Parse query parameters
  const searchParams = {
    dateSearch,
    idSearch,
    textSearch,
    communitySearch: communityParam === "on",
    standardSearch: standardParam === "on",
  };

  // Surveys from database
  const matchingSurveys = await surveyBySearch({ client, ...searchParams });
  console.log(searchParams);

  // Out of all the Surveys returned, page start and page end are the indeces
  // of the first and last Surveys that wil appear on the page
  const pageStartIdx = pageParam ? (Number(pageParam) - 1) * PER_PAGE : 0;
  const pageEndIdx = pageParam ? Number(pageParam) * PER_PAGE : PER_PAGE;

  const pageSurveys = matchingSurveys.slice(pageStartIdx, pageEndIdx);
  const newPage = Number(pageParam) || 1;

  const totalSurveysNum = matchingSurveys.length;
  const pageSurveysNum = pageSurveys.length;
  const pageStart = pageStartIdx + 1;
  const pageEnd = Math.min(pageEndIdx, matchingSurveys.length);
  const metadata = {
    totalSurveysNum,
    pageSurveysNum,
    pageStart,
    pageEnd,
    newPage,
  };

  // Get votes from database
  if (pageSurveys) {
    const votes = await Promise.all(
      pageSurveys.map(async (survey) => {
        return await votesBySurvey(client, survey._id);
      })
    );

    // Return data
    let message =
      matchingSurveys.length === 0
        ? "No results returned."
        : `Showing ${pageStart} - ${pageEnd} out of ${matchingSurveys.length}`;
    const data = { pageSurveys, metadata, votes, message, ...firstAndLast };
    return json<LoaderData>(data);
  }
  return "";
};

export default () => {
  const transition = useTransition();
  const { metadata, firstSurvey, lastSurvey, message, pageSurveys } =
    useLoaderData<LoaderData>();
  const formRef = useRef<HTMLFormElement>(null!);

  const maxPage = Math.ceil(metadata.totalSurveysNum / PER_PAGE) || 1;

  return (
    <>
      <AnimatedBanner icon={emptyLogo} text="Search" />
      <main className="flex-grow mx-4 md:mx-auto max-w-6xl">
        <Form
          method="get"
          className="my-6 flex flex-col space-y-4 max-w-survey sm:max-w-xl mx-auto"
          ref={formRef}
        >
          <input
            type="text"
            name="text"
            placeholder="Search by keyword or Survey ID"
            className="border border-outline px-2"
            data-cy="text-search"
          />
          <div
            className="flex-grow flex flex-col justify-between space-y-3
        md:flex-row md:space-y-0"
          >
            <label htmlFor="date" className="w-full">
              Survey close date
              <input
                type="date"
                name="date"
                id="date"
                min={firstSurvey}
                max={lastSurvey}
                className="border border-outline mt-1 w-full md:w-40 min-w-[300px]"
              />
            </label>
            <div className="flex space-x-3 items-center">
              <label className="flex items-center md:mt-5">
                Community
                <input
                  className="mx-2 accent-accent"
                  type="checkbox"
                  name="community"
                  id="community"
                  defaultChecked
                />
              </label>
              <label className="flex items-center md:mt-5">
                Standard
                <input
                  className="mx-2 accent-accent"
                  type="checkbox"
                  name="standard"
                  id="standard"
                  defaultChecked
                />
              </label>
            </div>
          </div>
          <div className="flex justify-between border-outline ">
            <div className="flex items-center">
              <label className="flex mr-2 items-center">
                Page:{"  "}
                <input
                  type="number"
                  name="page"
                  className="text-center w-20 mx-2 border border-outline px-2"
                  max={maxPage}
                  min={1}
                />
              </label>
            </div>
            <div className="space-x-3">
              <button
                type="reset"
                className="cancel px-3 py-1"
                disabled={transition.state !== "idle"}
              >
                Reset
              </button>
              <button
                type="submit"
                className="silver px-3 py-1"
                disabled={transition.state !== "idle"}
              >
                Search
              </button>
            </div>
          </div>
        </Form>
        <div className="md:px-4">
          <section className="my-4">
            <span className="m-4" data-cy="message">
              {message}
            </span>
            <div
              className="flex flex-col md:flex-row flex-wrap gap-3"
              data-cy="search-results"
            >
              {pageSurveys.map((q) => {
                return <Survey survey={q} key={q._id} />;
              })}
            </div>
          </section>
        </div>
      </main>
    </>
  );
};
