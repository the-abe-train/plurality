import { Link } from "@remix-run/react";
import AnimatedBanner from "~/components/text/AnimatedBanner";
import InfoMenu from "~/components/navigation/InfoMenu";
import { THRESHOLD } from "~/util/constants";

export default () => {
  return (
    <main className="flex-grow mx-4 md:mx-auto mb-4 max-w-4xl my-4">
      <AnimatedBanner text="How to Play" />
      <div className="flex flex-col md:flex-row-reverse my-4 ">
        <section className="space-y-6">
          <article className="space-y-2">
            <h2 className="text-2xl font-header">Connecting to Plurality</h2>
            <p>
              The first thing you need to do to interact with Plurality is
              connect, either with an email and password or via your Crypto
              wallet. Parts of Plurality rely on your Crypto wallet's
              authentication protocol. If you already have an Ethereum wallet
              associated with your browser, click the “Connect” button in the
              header to log-in. If you don't, you can make one using the
              Metamask browser extension or mobile app.
            </p>
            <p className="italic">
              What can I do now that I'm conected? Start playing a Survey!
            </p>
          </article>
          <article className="space-y-2">
            <h2 className="mt-3 text-2xl font-header">Playing a Survey</h2>
            <p>
              Every day there is a new Survey. To play a Survey, you must try to
              guess the most common responses to the Survey question. To win,
              you must guess how over {THRESHOLD}% of players responded to that
              Survey. You are only allowed 20 guesses to pass the {THRESHOLD}%
              threshold. A guess is only valid if it was the response of at
              least 1 person.
            </p>
            <p>
              Hint: If you guess a response nobody gave, don't worry, it doesn't
              count. The danger is in guessing responses that <b>very few</b>{" "}
              people gave, because you will run out of guesses before you hit
              the threshold.
            </p>
            <p className="italic">
              But who are the Survey respondents? You are!
            </p>
          </article>
          <article className="space-y-2">
            <h2 className="mt-3 text-2xl font-header">Voting</h2>
            <p>
              Each survey has a 24 hour window for players to respond. Anyone
              can respond to the Survey in this time frame as long as they are
              signed-in.
            </p>
            <p className="italic">
              But who chooses the Survey questions? You do!
            </p>
          </article>
          <article className="space-y-2">
            <h2 className="mt-3 text-2xl font-header">Drafting</h2>
            <p>
              The first part of the Plurality process is the drafting of Survey
              questions. In order to draft a question, you must purchase the
              right do so in the form of an NFT, or “Survey Token”. There is one
              Survey per day, and one NFT per survey. The right to the daily
              Survey Token can purchased via auction on{" "}
              <a href="https://opensea.io">OpenSea.io</a>.
            </p>
            <p>
              Once you have the right to make the question for a given day,
              submit it{" "}
              <Link to="/draft" className="underline">
                here
              </Link>{" "}
              here and the Plurality team will review it before it goes live.
              Make sure to submit your question early to give us time to review!
              If no viable question is submitted by the time the survey opens, a
              fallback question will be used.
            </p>
          </article>
        </section>
        <InfoMenu page="how-to-play" />
      </div>
    </main>
  );
};
