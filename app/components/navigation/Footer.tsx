import type { LinksFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { emailIcon, githubIcon, twitterIcon, whiteLogo } from "~/images/icons";
import styles from "~/styles/app.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export default () => {
  return (
    <footer className="bg-secondary p-4 text-primary1 mt-4 text-sm">
      <div
        className="w-full md:px-4 flex flex-col md:flex-row justify-between max-w-4xl 
      mx-auto items-center space-y-3 md:space-y-0"
      >
        <section
          className="flex md:flex-col justify-center items-end 
        md:items-start space-x-4 md:space-x-0 w-full md:w-max"
        >
          <div className="font-header text-xl space-x-1 flex items-center">
            <img className="inline h-5" src={whiteLogo} alt="logo" />
            <span>Plurality</span>
          </div>
          <p>© Plurality {new Date().getFullYear()}</p>
        </section>
        <section className="flex justify-between w-full md:w-max md:space-x-3 items-center">
          <div>
            <b>Plurality</b> was created by <br />
            <a className="underline" href="https://twitter.com/theAbeTrain">
              The Abe Train
            </a>{" "}
            &{" "}
            <a className="underline" href="https://twitter.com/enriqueolivojr">
              The Enrique Olivo
            </a>
          </div>
          <a href="https://twitter.com/pluralitygame">
            <img src={twitterIcon} width={20} alt="Twitter" />
          </a>
          <a href="https://github.com/the-abe-train/plurality">
            <img src={githubIcon} width={20} alt="GitHub" />
          </a>
          <a href="mailto:team@plurality.fun">
            <img src={emailIcon} width={20} alt="Email" />
          </a>
        </section>
        <section>
          <ul className="grid grid-cols-4 gap-x-4 justify-items-center">
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
              <Link to="/surveys">Search</Link>
            </li>
            <li>
              <Link to="/help/what-is-plurality">Help</Link>
            </li>
            <li>
              <Link to="/help/policies">Policies</Link>
            </li>
          </ul>
        </section>
      </div>
    </footer>
  );
};
