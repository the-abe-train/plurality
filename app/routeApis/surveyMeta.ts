import { MetaFunction } from "@remix-run/node";
import { SurveySchema } from "~/db/schemas";

type LoaderData = {
  survey: SurveySchema;
};

export const surveyMeta: MetaFunction = ({ data }: { data: LoaderData }) => {
  if (!data) {
    return {
      title: `Plurality Survey Not Found`,
    };
  }
  return {
    title: `Plurality Survey #${data.survey._id}`,
    description: `Plurality Survey #${data.survey._id}: ${data.survey.text}`,
    "twitter:image": `https://source.unsplash.com/${data.survey.photo}/600x300`,
    "twitter:image:alt": data.survey.text,
    "twitter:card": "summary_large_image",
    "og:url": `https://plurality.fun/surveys/${data.survey._id}/guess`,
    "og:title": `Plurality Survey #${data.survey._id}`,
    "og:description": `Plurality Survey #${data.survey._id}`,
    "og:site_name": "Plurality",
    "og:image": `https://source.unsplash.com/${data.survey.photo}/600x300`,
    "og:image:alt": data.survey.text,
  };
};
