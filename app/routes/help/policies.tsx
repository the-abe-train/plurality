import { Link } from "@remix-run/react";
import AnimatedBanner from "~/components/text/AnimatedBanner";
import InfoMenu from "~/components/navigation/InfoMenu";

export default () => {
  return (
    <main className="flex-grow mx-4 md:mx-auto mb-4 max-w-4xl my-4">
      <AnimatedBanner text="Policies" />
      <div className="flex flex-col md:flex-row-reverse my-4">
        <section className="space-y-6">
          <article className="space-y-2">
            <h2 className="text-2xl font-header">Privacy Policy</h2>
            <p>
              When you create an account on Plurality using your email address,
              the address is stored in our Mongo Atlas database unencrypted. We
              use the email address to send you “email verification” emails, to
              respond to your help requests and feedback, and to confirm your
              Survey drafts. We will never share this information with a third
              party.
            </p>
            <p>
              Your password is encrypted (salted and hashed) in our database.
              Even with that precaution, we recommend that you use a unique and
              difficult-to-guess password when creating an account with
              Plurality.
            </p>
            <p>
              When you visit Plurality, the server leaves a cookie on your
              browser confirm that you are signed in. The cookie is called
              “user” and you can see it in your browser's dev tools, but you
              won't be able to read the information because it is encrypted.
              This cookie does not track your behaviour on the page, and it does
              not track your activity on other sites, nor do we use any
              third-party cookies for analytics.
            </p>
          </article>
          <article className="space-y-2">
            <h2 className="mt-3 text-2xl font-header">Moderation Policy</h2>
            <p>
              Survey responses are moderated using automatic filters, and Survey
              drafts are directly vetted by the Plurality team. We want the
              people drafting Survey Questions to not feel limited in what they
              can submit. At the same time, however, we want to take the extra
              step to ensure that Survey Questions are understandable and
              inoffensive. To that end, all Survey Questions will be approved by
              the Plurality moderation team to ensure that Survey Questions do
              not promote hatred or violence against any individuals or groups.
            </p>
          </article>
          <article className="space-y-2">
            <h2 className="mt-3 text-2xl font-header">NFT Terms of Sale</h2>
            <p>
              Plurality exists to operate as a community-based game by using
              blockchain technology to facilitate participation in certain
              aspects of gameplay.
            </p>
            <p>
              Specifically, we are offering for sale Non-Fungible Tokens
              (”NFTs”) that represent the right to draft a certain day's Survey
              Question that would then be posed to the Plurality community as
              part of Plurality's gameplay. Each Survey Question NFT will
              contain only the right to draft one specific day's Survey
              Question. This right to draft a Survey Question will also be
              subject to Plurality's rules, the terms of which are outlined in
              the Moderation Policy.{" "}
            </p>
            <p>
              Without prejudice to any other provision of these Terms of Sale,
              you acknowledge and agree that, except in the case of Plurality's
              fraud or willful default, and except as otherwise required by any
              non-waivable provision of applicable law, Plurality shall not be
              liable in any manner whatsoever to you or any other person for
              losses or damages of any kind, whether arising in contract, tort,
              or otherwise, arising from the sale of NFTs to any person.
            </p>
            <p>
              All purchases of any Survey Question NFTs are final and
              nonrefundable.
            </p>
          </article>
          <article className="space-y-2">
            <h2 className="mt-3 text-2xl font-header">
              Environmental Assessment
            </h2>
            <p>
              The environmental impact of trading NFTs on the Ethereum
              blockchain is considerable, and not a matter that we take lightly.
              We decided to launch the first NFTs on Ethereum because OpenSea's
              Ethereum NFTs because it was the simplest way for our project to
              get started using their API, and because it is the network people
              are most familiar with. We are also confident that the
              blockchain's upcoming change to proof-of-stake will hugely reduce
              the environmental impact, and regardless of the future of
              Ethereum, we are researching other blockchains to see if there is
              a better solution.
            </p>
            <p>
              It is difficult to directly measure the carbon footprint of our
              NFTs, but if you would like to learn more, check out{" "}
              <a href="https://kylemcdonald.github.io/ethereum-emissions/">
                Kyle McDonald's
              </a>
              work on measuring the energy required and emissions produced by
              Ethereum transactions.
            </p>
          </article>
          <article className="space-y-2">
            <h2 className="mt-3 text-2xl font-header">Aggregated Statistics</h2>
            <p>
              We may collect statistics about the behavior of visitors to its
              website using database and server information. This information
              may be displayed publicly or provided it to others. However, we
              will never disclose any personally-identifying information.
            </p>
          </article>
        </section>
        <InfoMenu page="policies" />
      </div>
    </main>
  );
};
