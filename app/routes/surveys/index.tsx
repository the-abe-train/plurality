import { useEffect, useRef, useState } from "react";
import type {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useSubmit,
  useTransition,
} from "@remix-run/react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";

import { SurveySchema, VoteAggregation } from "~/db/schemas";
import { getAllSurveyIds, surveyBySearch, votesBySurvey } from "~/db/queries";
import { client } from "~/db/connect.server";

import { PER_PAGE } from "~/util/constants";

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
};

export const loader: LoaderFunction = async () => {
  const surveys = await getAllSurveyIds(client);
  const formatDate = (date: Date) =>
    dayjs(date).tz("America/Toronto").format("YYYY-MM-DD");
  console.log("Surveys", surveys);
  const firstSurvey = formatDate(surveys[0]);
  const lastSurvey = formatDate(surveys[surveys.length - 1]);
  const data = { firstSurvey, lastSurvey };
  return json<LoaderData>(data);
};

type ActionData = {
  pageSurveys: SurveySchema[];
  metadata: {
    pageStart: number;
    pageEnd: number;
    totalSurveysNum: number;
    pageSurveysNum: number;
  };
  votes: VoteAggregation[][];
};

export const action: ActionFunction = async ({ request }) => {
  // Parse form
  const body = await request.formData();
  const textParam = body.get("text");
  const dateParam = body.get("date") as string;
  const pageParam = body.get("page");

  // Values show up as "on" or null
  const communityParam = body.get("community");
  const standardParam = body.get("standard");

  const [year, month, day] = dateParam.split("-").map((str) => Number(str));
  const midnight = new Date(Date.UTC(year, month - 1, day + 1, 3, 59, 59, 999));

  // Parse query parameters
  const searchParams = {
    dateSearch: midnight,
    idSearch: Number(textParam),
    textSearch: textParam
      ? new RegExp(String.raw`${textParam}`, "gi")
      : /^\S+$/,
    communitySearch: communityParam === "on",
    standardSearch: standardParam === "on",
  };

  // Out of all the Surveys returned, page start and page end are the indeces
  // of the first and last Surveys that wil appear on the page
  const pageStart = pageParam ? (Number(pageParam) - 1) * PER_PAGE : 0;
  const pageEnd = pageParam ? Number(pageParam) * PER_PAGE : PER_PAGE;

  // Surveys from database
  const matchingSurveys = await surveyBySearch({ client, ...searchParams });

  const pageSurveys = matchingSurveys.slice(pageStart, pageEnd);

  const metadata = {
    totalSurveysNum: matchingSurveys.length,
    pageSurveysNum: pageSurveys.length,
    pageStart: Math.min(pageStart, matchingSurveys.length),
    pageEnd: Math.min(pageEnd, matchingSurveys.length),
  };

  // Get votes from database
  if (pageSurveys) {
    const votes = await Promise.all(
      pageSurveys.map(async (survey) => {
        return await votesBySurvey(client, survey._id);
      })
    );

    // Return data
    const data = { pageSurveys, metadata, votes };
    return json<ActionData>(data);
  }
  return "";
};

export default () => {
  const submit = useSubmit();
  const [page, setPage] = useState(1);
  const formRef = useRef<HTMLFormElement>(null!);
  const transition = useTransition();

  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const showData = (actionData?.metadata.totalSurveysNum || 0) > 0;

  useEffect(() => {
    if (actionData?.metadata) {
      const maxPages = Math.max(
        Math.ceil(actionData.metadata.totalSurveysNum / 5),
        1
      );
      setPage(Math.min(page || 1, maxPages));
    }
  }, [actionData]);

  async function turnPage(change: number) {
    if (actionData?.metadata) {
      const { pageSurveysNum, totalSurveysNum } = actionData?.metadata;

      const newFormData = new FormData(formRef.current);
      const currentPage = Number(newFormData.get("page"));

      // If there are fewer than 6 survyes on the page, don't increase
      if (pageSurveysNum < 6 && change > 0) return;

      // If the current page is 1, don't decrease
      if (currentPage === 1 && change < 0) return;

      // If the current page is the final page, don't increase
      const seenSurveys = pageSurveysNum + currentPage * 6;
      if (seenSurveys === totalSurveysNum && change > 1) return;

      const newPage = currentPage + change;
      setPage(newPage);
      newFormData.set("page", String(newPage));
      submit(newFormData, {
        method: "post",
        action: "/surveys?index",
        replace: true,
      });
    }
  }

  return (
    <>
      <AnimatedBanner icon={emptyLogo} text="Search" />
      <main className="flex-grow mx-4 md:mx-auto max-w-6xl">
        <Form
          method="post"
          className="m-6 flex flex-col space-y-4 max-w-xl mx-auto px-4"
          ref={formRef}
        >
          <input
            type="text"
            name="text"
            placeholder="Search by keyword or Survey ID"
            className="border border-outline px-2"
          />
          <div
            className="flex-grow flex flex-col justify-between space-y-3
        md:flex-row md:space-y-0"
          >
            <input
              type="date"
              name="date"
              id="date"
              min={loaderData.firstSurvey}
              max={loaderData.lastSurvey}
              className="border border-outline px-2 min-w-[300px]"
            />
            <div className="flex space-x-3 items-center">
              <label className="flex items-center">
                Community
                <input
                  className="mx-2 accent-accent"
                  type="checkbox"
                  name="community"
                  id="community"
                  defaultChecked
                />
              </label>
              <label className="flex items-center">
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
              <button
                className="px-2 border border-outline rounded-full bg-white h-min"
                onClick={() => turnPage(-1)}
                type="button"
              >
                -
              </button>
              <label className="flex mx-2 items-center">
                Page:{"  "}
                <input
                  type="text"
                  name="page"
                  id="page"
                  placeholder="Page"
                  className="text-center w-5"
                  onChange={(e) => e.target.value}
                  value={page}
                />
              </label>
              <button
                className="px-2 border border-outline rounded-full bg-white h-min"
                onClick={() => turnPage(1)}
                type="button"
                disabled={transition.state !== "idle"}
              >
                +
              </button>
            </div>
            <div className="space-x-4">
              <button
                type="reset"
                className="cancel px-3 py-1"
                onClick={() => setPage(1)}
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
          {showData && actionData?.metadata && (
            <section className="my-4">
              <div className="m-4 flex justify-between">
                <span>
                  Showing {actionData.metadata.pageStart + 1} -{" "}
                  {actionData.metadata.pageEnd} out of{" "}
                  {actionData.metadata.totalSurveysNum}
                </span>
              </div>
              <div className="flex flex-col md:flex-row flex-wrap gap-3">
                {actionData.pageSurveys.map((q) => {
                  return <Survey survey={q} key={q._id} />;
                })}
              </div>
            </section>
          )}
          {!showData && actionData?.metadata && <p>No results returned.</p>}
        </div>
      </main>
    </>
  );
};
