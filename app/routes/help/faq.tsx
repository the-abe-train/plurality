import AnimatedBanner from "~/components/text/AnimatedBanner";
import InfoMenu from "~/components/navigation/InfoMenu";

export default () => {
  return (
    <main className="flex-grow mx-4 md:mx-auto mb-4 max-w-4xl my-4">
      <AnimatedBanner text="FAQ" />
      <div className="flex flex-col md:flex-row-reverse my-4">
        <section className="space-y-6">
          <article className="space-y-2">
            <h2 className="text-xl font-header">
              Is there any way to see all of a Survey's responses?
            </h2>
            <p>
              You won't be able to see <i>all</i> of the responses for a given
              Survey, but if you use up all your guesses, you'll be able to see
              the <i>top</i> responses. You'll also be able to see how well you
              did compared to everyone else who has played the Survey!
            </p>
          </article>
          <article className="space-y-2">
            <h2 className="mt-3 text-xl font-header">
              Why do different Surveys have a different maximum number of
              guesses?
            </h2>
            <p>
              The number of guesses allowed to try and beat the game depends on
              the variety of Survey responses. If the game can be beaten with
              under 10 guesses, then you will be allowed 20 guesses to beat the
              game and try to get the highest score. If, however, the game
              requires more than 10 guesses to reach the 60% threshold, then
              more guesses are allowed.
            </p>
          </article>
        </section>
        <InfoMenu page="faq" />
      </div>
    </main>
  );
};
