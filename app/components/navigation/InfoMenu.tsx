import { Link } from "@remix-run/react";
import { emptyLogo } from "~/images/icons";

const data = [
  { name: "How to Play", path: "how-to-play" },
  { name: "FAQ", path: "faq" },
  { name: "Terminology", path: "terminology" },
  { name: "Privacy Policy", path: "privacy-policy" },
  { name: "About & Contact", path: "about-and-contact" },
];

export default ({ page }: { page: string }) => {
  return (
    <nav
      className="grid grid-rows-2 grid-cols-2 gap-y-4 gap-x-5 mx-auto my-4 w-full
md:my-0 md:flex flex-col md:space-y-4 p-2 md:p-4 h-min md:mr-8 card md:w-min"
    >
      {data.map(({ name, path }) => {
        return (
          <Link
            className="flex items-center w-full pr-4"
            to={`/help/${path}`}
            key={name}
            style={{ fontWeight: page === path ? "bold" : "" }}
            data-cy={path}
          >
            {page === path && (
              <img src={emptyLogo} alt="logo" className="inline mr-2" />
            )}
            <span>{name}</span>
          </Link>
        );
      })}
    </nav>
  );
};
