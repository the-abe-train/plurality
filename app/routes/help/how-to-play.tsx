import AnimatedBanner from "~/components/text/AnimatedBanner";
import InfoMenu from "~/components/navigation/InfoMenu";
import { THRESHOLD } from "~/util/gameplay";

export default () => {
  return (
    <main className="flex-grow px-4 mx-auto mb-4 max-w-4xl my-4">
      <AnimatedBanner text="How to Play" />
      <div className="flex flex-col md:flex-row-reverse my-4 ">
        <section className="space-y-6">
          <article className="space-y-2">
            <h2 className="text-2xl font-header">What is Plurality?</h2>
            <p>Plurality is:</p>
            <ul className="list-disc list-inside mx-8">
              <li className="list-outside">
                A <b>game</b> that tests how well you know the most common
                opinions on the internet.
              </li>
              <li className="list-outside">
                A <b>platform</b> that invites you to share your opinions with
                the rest of the world.
              </li>
              <li className="list-outside">
                A <b>decentralized</b> application that uses that allows users
                to control the direction of the game.
              </li>
            </ul>
            <p>
              There are 3 things you can do on Plurality: Guessing, Responding,
              and Drafting. Learn more about each below!
            </p>
          </article>
          <article className="space-y-2">
            <h2 className="text-2xl font-header">Guessing</h2>
            <p>
              Every day, a new Survey becomes available for playing. You can
              play a Survey by guessing what were the most common responses to
              the Survey question. The percentage of total responses represented
              by your guesses is your score. To win, you need to reach a score
              of at least {THRESHOLD}%. However, you are only allowed a limited
              number guesses.
            </p>
            <p>
              The more diverse the Survey responses, the harder it will be to
              guess {THRESHOLD}% of them. Thus the number of guesses allowed for
              each Survey depends on the variety of answers submitted. Every
              Survey is winnable using the allowed number of guesses, but some
              will be more difficult than others!
            </p>
            <p>
              Hint: If you guess a response that nobody submitted, don't worry,
              it doesn't count. The danger is in guessing responses that{" "}
              <b>very few</b> people gave, because you will run out of guesses
              before getting a high enough score to win.
            </p>
            <p className="italic">
              But who are the Survey respondents? You are!
            </p>
          </article>
          <article className="space-y-2">
            <h2 className="mt-3 text-2xl font-header">Responding</h2>
            <p>
              Anyone who is signed-in can respond to any open Survey. At a given
              time, several Surveys will be up on the site. Responses can either
              be a single word or number, depending on the Survey category.
              Users will be prompted to check their spelling if their response
              is flagged as a potential typo. Rude and hateful responses are not
              allowed.
            </p>
            <p className="italic">
              But who chooses the Survey questions? You do!
            </p>
          </article>
          <article className="space-y-2">
            <h2 className="mt-3 text-2xl font-header">Drafting</h2>
            <p>
              Survey questions are chosen either by the Plurality team, or by
              you, the player! Writing your own Survey question is called
              Drafting, and it costs $5 CAD. After the purchase, Survey drafts
              are placed "Under Review". After they have been reviewed and
              approved, they will show up in the queue as questions Surveys for
              players to respond to, and eventually play!
            </p>
          </article>
        </section>
        <InfoMenu page="how-to-play" />
      </div>
    </main>
  );
};
