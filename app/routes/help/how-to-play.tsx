import AnimatedBanner from "~/components/text/AnimatedBanner";
import InfoMenu from "~/components/navigation/InfoMenu";
import { THRESHOLD } from "~/util/gameplay";

export default () => {
  return (
    <main className="flex-grow mx-4 md:mx-auto mb-4 max-w-4xl my-4">
      <AnimatedBanner text="How to Play" />
      <div className="flex flex-col md:flex-row-reverse my-4 ">
        <section className="space-y-6">
          <article className="space-y-2">
            <h2 className="mt-3 text-2xl font-header">Guessing</h2>
            <p>
              Every day there is a new Survey. To play a Survey, you must try to
              guess the most common responses to the Survey question. To win,
              you must guess how over {THRESHOLD}% of players responded to that
              Survey. You are only allowed a limited number guesses to pass the{" "}
              {THRESHOLD}% threshold. A guess is only valid if it was the
              response of at least 1 person.
            </p>
            <p>
              The more diverse the Survey responses, the harder it will be to
              guess {THRESHOLD}% of responses. Thus the number of guesses
              allowed for each Survey depends on the variety of answers
              submitted to the Survey. Every Survey is winnable using the
              allowed number of guesses, but some will be more difficult than
              others!
            </p>
            <p>
              Hint: If you guess a response that nobody submitted while the
              Survey was open, don't worry, it doesn't count towards your
              guesses. The danger is in guessing responses that <b>very few</b>{" "}
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
              right do so. The Plurality team reviews all Survey questions
              before they go live.
            </p>
          </article>
        </section>
        <InfoMenu page="how-to-play" />
      </div>
    </main>
  );
};
