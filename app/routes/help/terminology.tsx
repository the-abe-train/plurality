import AnimatedBanner from "~/components/text/AnimatedBanner";
import InfoMenu from "~/components/navigation/InfoMenu";

export default () => {
  return (
    <main className="flex-grow mx-4 md:mx-auto mb-4 max-w-4xl my-4">
      <AnimatedBanner text="Terminology" />
      <div className="flex flex-col md:flex-row-reverse my-4">
        <section className="space-y-6">
          <article className="space-y-2">
            <h2 className="text-2xl font-header">The Shiny Colours</h2>
            <p>
              Every element on Plurality that you can interact with has a shiny,
              metallic gradient.
            </p>
            <p>
              <b className="gold-text">Gold</b> indicates a Community Survey,
              i.e. a Survey question that was submitted by Plurality users. The
              buttons related to drafting Survey questions will be Gold as well.
            </p>
            <p>
              <b className="silver-text">Silver</b> indicates Standard Surveys,
              as well as all other buttons.
            </p>
          </article>
          <article>
            <h2 className="mt-3 mb-2 text-2xl font-header">Gameplay</h2>
            <table className="table-auto bg-primary2">
              <colgroup>
                <col className="border border-outline" />
                <col className="border border-outline" />
              </colgroup>
              <tbody>
                <tr className="border border-outline">
                  <td className="px-2 py-2 font-bold">Survey</td>
                  <td className="px-2 py-2">
                    A Survey is a question and its accompanying responses.
                  </td>
                </tr>
                <tr className="border border-outline">
                  <td className="px-2 py-2 font-bold">Response</td>
                  <td className="px-2 py-2">
                    A player's answer to a Survey that other players will try to
                    guess as part of gameplay.
                  </td>
                </tr>
                <tr className="border border-outline">
                  <td className="px-2 py-2 font-bold">Guessing</td>
                  <td className="px-2 py-2">
                    Playing a Survey is trying to guess the most common answers.
                  </td>
                </tr>
                <tr className="border border-outline">
                  <td className="px-2 py-2 font-bold">Drafting</td>
                  <td className="px-2 py-2">
                    The process of creating a custom Survey question. Can only
                    be done by users that are holding Survey Tokens.
                  </td>
                </tr>
                <tr className="border border-outline">
                  <td className="px-2 py-2 font-bold">Community</td>
                  <td className="px-2 py-2">
                    Surveys that were chosen by players via Drafting.
                  </td>
                </tr>
                <tr className="border border-outline">
                  <td className="px-2 py-2 font-bold">Standard</td>
                  <td className="px-2 py-2">
                    Surveys chosen by the Plurality team.
                  </td>
                </tr>
              </tbody>
            </table>
          </article>
        </section>
        <InfoMenu page="terminology" />
      </div>
    </main>
  );
};
