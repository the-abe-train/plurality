import { Link } from "@remix-run/react";
import { SurveySchema } from "~/db/schemas";
import NavButton from "../buttons/NavButton";

type Props = {
  survey?: SurveySchema;
  page: string;
};

export default function ({ survey, page }: Props) {
  const unsplashLink = survey
    ? "https://unsplash.com/photos/" + survey.photo
    : "";
  return (
    <div className="my-4 md:mt-12">
      {survey && (
        <div>
          {survey._id <= 8 && (
            <p className="my-2 ">
              Survey #{survey._id} is a{" "}
              <Link
                to="/help/terminology"
                className="underline"
                data-cy="help-link"
              >
                practice Survey.
              </Link>
            </p>
          )}{" "}
          {survey.author && (
            <p>
              Survey drafted by <b>{survey.author.name}</b>. To submit your own
              draft, click the button below.
            </p>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-3 my-3">
        {page === "guess" || <NavButton name="Guess" />}
        {page === "respond" || <NavButton name="Respond" />}
        {page === "draft" || <NavButton name="Draft" />}
      </div>
      <Link
        to="/surveys?community=on&standard=on"
        className="underline text-right w-full"
      >
        Play more Surveys
      </Link>
      {survey && (
        <p className="text-sm my-2 italic">
          Survey photo from{" "}
          <a className="underline" href={unsplashLink}>
            Unsplash
          </a>
        </p>
      )}
    </div>
  );
}
