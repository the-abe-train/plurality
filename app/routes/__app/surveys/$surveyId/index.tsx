import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { surveyMeta } from "~/routeApis/surveyMeta";
import { surveyCatch } from "~/routeApis/surveyCatch";

export const meta = surveyMeta;
export const CatchBoundary = surveyCatch;

export const loader: LoaderFunction = async ({ params }) => {
  const surveyId = Number(params.surveyId);
  return redirect(`/surveys/${surveyId}/guess`);
};

export default () => <></>;
