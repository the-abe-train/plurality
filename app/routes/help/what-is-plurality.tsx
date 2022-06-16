import AnimatedBanner from "~/components/text/AnimatedBanner";
import InfoMenu from "~/components/navigation/InfoMenu";

export default () => {
  return (
    <main className="flex-grow mx-4 md:mx-auto mb-4 max-w-4xl my-4">
      <AnimatedBanner text="What is Plurality?" />
      <div className="flex flex-col md:flex-row-reverse my-4 ">
        <section className="space-y-2">
          <p>
            In an increasingly divided world, many of us long to feel closer to
            the thoughts and feelings of the people outside our bubbles.
            Plurality is a response to this desire for community.
          </p>
          <p className="italic">But seriously, what IS Plurality?</p>
          <ul className="list-disc list-inside mx-8">
            <li className="list-outside">
              Plurality is a <b>game</b> that tests how well you know the most
              common opinions on the internet.
            </li>
            <li className="list-outside">
              Plurality is a <b>platform</b> that invites you to share your
              opinions with the rest of the world.
            </li>
            <li className="list-outside">
              Plurality is a <b>decentralized</b> application that uses that
              allows users to have a say in what the game looks like.
            </li>
          </ul>
          <p>
            Read the instructions to get started, or sign-up and dive right in!
          </p>
        </section>
        <InfoMenu page="what-is-plurality" />
      </div>
    </main>
  );
};
