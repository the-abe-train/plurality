import { Link } from "@remix-run/react";
import { emptyLogo } from "~/images/icons";

const data = [
  { name: "What is Plurality?", path: "what-is-plurality" },
  { name: "How to play", path: "how-to-play" },
  { name: "FAQ", path: "faq" },
  { name: "Terminology", path: "terminology" },
  { name: "Policies", path: "policies" },
];

export default ({ page }: { page: string }) => {
  return (
    <nav
      className="grid grid-rows-2 grid-cols-2 gap-y-4 gap-x-10 mx-auto my-4
md:my-0 md:flex flex-col md:space-y-4 w-max p-2 md:p-4 h-min md:mr-8 card"
    >
      {data.map(({ name, path }) => {
        return (
          <Link
            className="md:w-max flex items-center"
            to={`/help/${path}`}
            key={name}
            style={{ fontWeight: page === path ? "bold" : "" }}
            data-cy={path}
          >
            {page === path && (
              <img src={emptyLogo} alt="logo" className="inline mr-2" />
            )}
            {name}
          </Link>
        );
      })}
    </nav>
  );
};
