import { Link } from "@remix-run/react";
import dayjs from "dayjs";

type Props = {
  survey: SurveySchema;
};

export default function Survey({ survey }: Props) {
  const surveyClose = dayjs(survey.surveyClose);
  const action = surveyClose > dayjs() ? "respond" : "guess";
  const img = `https://plurality-cover-images.s3.ca-central-1.amazonaws.com/${survey.photo}.jpg`;
  return (
    <Link
      to={`/surveys/${survey._id}/${action}`}
      className="w-full md:w-fit inline-block"
    >
      <div
        className={`border border-outline rounded-lg 
     z-20 md:w-survey min-w-[260px] w-full mx-auto ${
       survey.community ? "gold" : "silver"
     }`}
      >
        <div className="z-0 h-40 overflow-hidden rounded-t-md bg-black">
          <img
            src={img}
            alt="question image"
            className="object-cover w-full h-full"
          />
        </div>
        <h2
          className="text-lg p-2 font-bold border-t z-30 border-outline
         rounded-b-lg"
        >
          #{survey._id} {survey.text}
        </h2>
      </div>
    </Link>
  );
}
