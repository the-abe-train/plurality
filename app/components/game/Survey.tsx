import { Link } from "@remix-run/react";
import dayjs from "dayjs";
import { SurveySchema } from "~/db/schemas";

type Props = {
  survey: SurveySchema;
};

export default function Survey({ survey }: Props) {
  const surveyClose = dayjs(survey.surveyClose);
  const action = surveyClose > dayjs() ? "respond" : "guess";
  return (
    <Link to={`/surveys/${survey._id}/${action}`}>
      <div
        className={`border border-outline rounded-lg 
     z-20 max-w-survey min-w-[260px] mx-auto ${
       survey.community ? "gold" : "silver"
     }`}
      >
        <div className="z-0 h-40 overflow-hidden rounded-t-md bg-black">
          <img
            src={`https://source.unsplash.com/${survey.photo}/600x300`}
            alt="question image"
            className="object-cover w-full h-full"
          />
        </div>
        <h2
          className="text-lg p-2 font-bold border-t-2 z-30 border-outline
         rounded-b-lg"
        >
          #{survey._id} {survey.text}
        </h2>
      </div>
    </Link>
  );
}
