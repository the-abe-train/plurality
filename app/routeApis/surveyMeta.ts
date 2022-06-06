import { MetaFunction } from "@remix-run/node";

export const surveyMeta: MetaFunction = ({ data, location }) => {
  if (!data) {
    return {
      title: `Plurality Survey Not Found`,
    };
  }
  return {
    title: `Plurality Survey #${data.survey._id}`,
    description: data.survey.text,
    "twitter:image": `https://source.unsplash.com/${data.survey.photo}/600x300`,
    "twitter:image:alt": data.survey.text,
    "twitter:card": "summary_large_image",
    "twitter:text:title": `Plurality Survey #${data.survey._id}`,
    "og:url": `https://plurality.fun${location.pathname}`,
    "og:title": `Plurality Survey #${data.survey._id}`,
    "og:description": data.survey.text,
    "og:site_name": "Plurality",
    "og:image": `https://source.unsplash.com/${data.survey.photo}/600x300`,
    "og:image:alt": data.survey.text,
  };
};
