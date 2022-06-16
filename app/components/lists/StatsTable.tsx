import { guessIcon, respondIcon, draftIcon } from "~/images/icons";
import { percentFormat } from "~/util/text";
import { UserStats } from "../schemas";
import Counter from "../text/Counter";

export default ({ userStats }: { userStats: UserStats }) => {
  const wonAnyGames = !!userStats.fewestGuesses.guesses;
  return (
    <section className="space-y-5">
      <h2 className="text-2xl my-2 font-header">Statistics</h2>
      <div className="flex w-full justify-around">
        <div className="flex space-x-3 items-center">
          <img src={guessIcon} width={32} alt="Guess icon" />
          <Counter value={userStats.gamesWon} />
        </div>
        <div className="flex space-x-3 items-center">
          <img src={respondIcon} width={32} alt="Respond icon" />
          <Counter value={userStats.responsesSubmitted} />
        </div>
        <div className="flex space-x-3 items-center">
          <img src={draftIcon} width={32} alt="Draft icon" />
          <Counter value={userStats.surveysDrafted} />
        </div>
      </div>
      <table className="table-auto">
        <colgroup>
          <col className="bg-primary2 border-l border-outline min-w-[3rem]" />
          <col className="bg-primary2 border-r border-outline min-w-[3rem]" />
          <col className="bg-primary2 border-l border-outline min-w-[3rem]" />
          <col className="bg-primary2 border-r border-outline min-w-[3rem]" />
        </colgroup>
        <tbody>
          <tr className="font-bold border border-outline ">
            <td className="px-2 py-2 text-center">Games won</td>
            <td className="px-2 py-2 text-center">{userStats.gamesWon}</td>
            <td className="px-2 py-2 text-center">Games played</td>
            <td className="px-2 py-2 text-center">{userStats.gamesPlayed}</td>
          </tr>
          <tr className="font-bold border border-outline ">
            <td className="px-2 py-2 text-center">Responses submitted</td>
            <td className="px-2 py-2 text-center">
              {userStats.responsesSubmitted}
            </td>
            <td className="px-2 py-2 text-center">Highest score</td>
            <td className="px-2 py-2 text-center">
              {wonAnyGames &&
                `${percentFormat(userStats.highestScore.score)} (#${
                  userStats.highestScore.survey
                })`}
            </td>
          </tr>
          <tr className="font-bold border border-outline ">
            <td className="px-2 py-2 text-center">Surveys drafted</td>
            <td className="px-2 py-2 text-center">
              {userStats.surveysDrafted}
            </td>
            <td className="px-2 py-2 text-center">Fewest guesses to win</td>
            <td className="px-2 py-2 text-center">
              {wonAnyGames &&
                `${userStats.fewestGuesses.guesses} (#${userStats.fewestGuesses.survey})`}
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  );
};
