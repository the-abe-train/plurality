import AnimatedBanner from "~/components/text/AnimatedBanner";
import InfoMenu from "~/components/navigation/InfoMenu";
import { Link } from "@remix-run/react";
import brunch from "~/images/photos/brunch.jpg";

export default () => {
  return (
    <main className="flex-grow px-4 mx-auto mb-4 max-w-4xl my-4">
      <AnimatedBanner text="About Me" />
      <div className="flex flex-col md:flex-row my-4">
        <div className=" order-last md:order-first">
          <InfoMenu page="about-me" />
        </div>
        <section className="space-y-6">
          <article className="space-y-2">
            <h2 className="text-2xl font-header">The Abe Train</h2>
            <p>
              Hello! I'm Abe, a freelance web developer based in Toronto,
              Canada. I make games like Plurality and{" "}
              <a href="https://globle-game.com" className="underline">
                Globle
              </a>
              . If you would like to support the game, the best way to do so is
              by buying a{" "}
              <Link className="underline" to="/draft">
                Draft
              </Link>{" "}
              for $5. This helps me keep the lights on at home, and also saves
              me the trouble of coming up with all the Survey questions myself!
            </p>
            <p>
              If you are having any questions or concerns about the game, the
              best way to reach me is through a DM on{" "}
              <a className="underline" href="https://twitter.com/theAbeTrain">
                Twitter
              </a>
              , or through the form on my{" "}
              <a className="underline" href="https://the-abe-train.com">
                personal website.
              </a>
            </p>
            <p>Thank you for playing!</p>
          </article>
        </section>
        <figure className="max-w-none md:pl-10 py-4 ">
          <img
            src={brunch}
            alt="Abe eating a colossal brunch in Montreal."
            className="md:max-h-64 md:py-0 drop-shadow-block max-w-none "
          />
          <figcaption className="text-sm italic py-1">
            Abe eating a delicious brunch in Montreal
          </figcaption>
        </figure>
      </div>
    </main>
  );
};
