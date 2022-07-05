import { Link } from "@remix-run/react";
import dayjs from "dayjs";
import { DraftSchema } from "~/db/schemas";

type Props = {
  drafts: DraftSchema[];
  showButton?: boolean;
};

export default ({ drafts, showButton }: Props) => {
  if (drafts.length === 0) {
    return (
      <div>
        <h2 className="font-header text-2xl" data-cy="draft-header">
          Your Drafts
        </h2>
        <p className="my-3">You don't have any drafts yet!</p>
        {showButton && (
          <Link to="/draft">
            <button className="gold px-3 py-1">Submit a draft</button>
          </Link>
        )}
      </div>
    );
  }

  // TODO if status is "Online", should have a link to that Survey

  return (
    <div className="my-1">
      <h2 className="font-header text-2xl" data-cy="draft-header">
        Your Drafts
      </h2>
      <table className="table-auto my-3 border-outline font-bold bg-primary2">
        <colgroup className="border">
          <col className="border border-outline w-24" />
          <col className="border border-outline w-52" />
          <col className="border border-outline" />
        </colgroup>
        <tbody>
          <tr className="border border-outline">
            <td className="px-2 py-2">Submitted</td>
            <td className="px-2 py-2">Survey</td>
            <td className="px-2 py-2">Status</td>
          </tr>
          {drafts.map(({ text, status, submitted }, idx) => {
            return (
              <tr key={idx} className="text-sm border border-outline">
                <td className="px-2 py-2">
                  {dayjs(submitted).format("YYYY-MM-DD")}
                </td>
                <td className="px-2 py-2">{text}</td>
                <td className="px-2 py-2">{status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p>
        Have a question about your draft? DM me on{" "}
        <a href="https://twitter.com/theAbeTrain" className="underline">
          Twitter
        </a>
        !
      </p>
    </div>
  );
};
