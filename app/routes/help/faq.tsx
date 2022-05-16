import AnimatedBanner from "~/components/text/AnimatedBanner";
import InfoMenu from "~/components/navigation/InfoMenu";

export default () => {
  return (
    <main className="flex-grow mx-4 md:mx-auto mb-4 max-w-4xl my-4">
      <AnimatedBanner text="FAQ" />
      <div className="flex flex-col md:flex-row-reverse my-4">
        <section className="space-y-6">
          <article className="space-y-2">
            <h2 className="text-2xl font-header">What is a DApp?</h2>
            <p>
              A decentralized application, or DApp, is an app that relies to any
              extent on Crypto technology. Crypto's role in the app may vary
              from giving users a say in the function of the app to letting
              users make a profit by engaging with NFTs.
            </p>
            <p>
              There is no single definition for a DApp, but they do tend to have
              many fundamental principles in common, including the following:
            </p>
            <ol className="list-decimal list-inside">
              <li>
                The operation of the website relies on blockchain smart
                contracts.
              </li>
              <li>The code for the app is open source.</li>
              <li>Users have a say in what the application looks like.</li>
              <li>Authentication depends on a Crypto wallet.</li>
            </ol>
          </article>
          <article className="space-y-2">
            <h2 className="mt-3 text-2xl font-header">What is an NFT?</h2>
            <p>
              Here's a super brief rundown of Crypto technology: All Crypto
              depends on blockchains. A blockchain is a ledger (i.e. a list of a
              transactions) that, because of complex Cryptographic algorithms
              and decentralization, cannot be tampered with, thus everyone
              always agrees on the information they contain.
            </p>
            <p>
              There are 3 types of assets that can be traded on a blockchain: a
              coin (the fundamental currency of the blockchain that keeps it
              running), a token (an additional currency that can piggyback on a
              blockchain) and a non-fungible token, or NFT. NFTs are not a
              currency like tokens and coins because each NFT is unique (i.e.
              non-fungible).
            </p>
            <p>
              Since NFTs are unique and, due to the infallibility of the
              blockchain, their ownership is indisputable, they have become
              popular trade-able and collectible assets, usually taking the form
              of digital art.
            </p>
          </article>
          <article className="space-y-2">
            <h2 className="mt-3 text-2xl font-header">
              What's so cool about having a Survey NFT?
            </h2>
            <p>
              Plurality sells NFTs on OpenSea that provide the right to choose
              the survey question for a given day. Additionally, the owner of a
              Survey NFT is the only person who can see all of that survey's
              responses, as opposed to players who can only see the answers they
              guess. Survey NFTs, like all NFTs, can be bought and sold at
              different prices.
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
