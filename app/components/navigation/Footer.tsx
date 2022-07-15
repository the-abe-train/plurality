import type { LinksFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { githubIcon, twitterIcon, whiteLogo } from "~/images/icons";
import styles from "~/styles/app.css";
import SnackAdUnit from "../ads/SnackAdUnit";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export default () => {
  return (
    <footer className="mt-4 text-sm w-full">
      {/* <SnackAdUnit unitName="snack_dex1" siteId="2903" /> */}
      <div id="snack_dex1" />
      <div className="w-full bg-secondary p-4 mt-4 text-primary1">
        <div
          className="flex flex-col md:flex-row justify-between max-w-4xl 
          md:px-4 w-full
      mx-auto items-center space-y-3 md:space-y-0"
        >
          <section
            className="flex md:flex-col justify-center items-end 
        md:items-start space-x-4 md:space-x-0 w-full md:w-max"
          >
            <div className="font-header text-xl space-x-1 flex items-center">
              <img
                className="inline"
                height={20}
                width={20}
                src={whiteLogo}
                alt="logo"
              />
              <span>Plurality</span>
            </div>
            <p>© Plurality {new Date().getFullYear()}</p>
          </section>
          <section className="flex justify-center w-full md:w-max space-x-6 items-center">
            <div>
              <b>Plurality</b> was created by <br />
              <a className="underline" href="https://the-abe-train.com">
                The Abe Train
              </a>{" "}
              &{" "}
              <a
                className="underline"
                href="https://twitter.com/enriqueolivojr"
              >
                The Enrique Olivo
              </a>
            </div>
            <a href="https://twitter.com/theAbeTrain">
              <img src={twitterIcon} width={20} height={20} alt="Twitter" />
            </a>
            <a href="https://github.com/the-abe-train/plurality">
              <img src={githubIcon} width={20} height={20} alt="GitHub" />
            </a>
          </section>
          <section>
            <ul className="grid grid-cols-5 gap-x-4 justify-items-center">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/user">Profile</Link>
              </li>
              <li>
                <Link to="/surveys/today">Guess</Link>
              </li>
              <li>
                <Link to="/surveys/tomorrow">Respond</Link>
              </li>
              <li>
                <Link to="/draft">Draft</Link>
              </li>
              <li>
                <Link to="/surveys?community=on&standard=on">Search</Link>
              </li>
              <li>
                <Link to="/help/how-to-play">Help</Link>
              </li>
              <li>
                <Link to="/help/privacy-policy">Policies</Link>
              </li>
              <li>
                <Link to="/help/about-and-contact">About</Link>
              </li>
              <li>
                <Link to="/help/about-and-contact">Contact</Link>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </footer>
  );
};
