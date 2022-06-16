import AnimatedBanner from "~/components/text/AnimatedBanner";
import InfoMenu from "~/components/navigation/InfoMenu";

export default () => {
  return (
    <main className="flex-grow mx-4 md:mx-auto mb-4 max-w-4xl my-4">
      <AnimatedBanner text="FAQ" />
      <div className="flex flex-col md:flex-row-reverse my-4">
        <section className="space-y-6">
          <article className="space-y-2">
            <h2 className="mt-3 text-2xl font-header">
              Is there any way to see all the Survey responses?
            </h2>
            <p>
              You won't be able to see <i>all</i> of the responses for any given
              Survery, but if you use up all your guesses, you'll be able to see
              the top responses. You'll also be able to see how well you did
              compared to everyone else who has played the Survey!
            </p>
          </article>
          <article className="space-y-2">
            <h2 className="mt-3 text-2xl font-header">
              Why do survey questions need to be approved?
            </h2>
            <p>
              We do not want survey drafters to be overly limited in what they
              can submit as a survey question. We do, however, want to make sure
              that the game is playable and fun for everyone, and that means
              taking the extra step to make sure that survey questions are
              neither hateful nor esoteric in nature.
            </p>
          </article>
        </section>
        <InfoMenu page="faq" />
      </div>
    </main>
  );
};
