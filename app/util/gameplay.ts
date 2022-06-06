import { RankedVote, VoteAggregation } from "~/db/schemas";

export const PER_PAGE = 6;
export const THRESHOLD = 60; // This is a %
export const NAME_LENGTH = 16;

export function checkWin(guesses: VoteAggregation[], totalVotes: number) {
  const points = guesses.reduce((sum, guess) => {
    return sum + guess.votes;
  }, 0);
  const absThreshold = totalVotes * (THRESHOLD / 100);
  return points >= absThreshold;
}

export function getTotalVotes(answers: RankedVote[]) {
  return answers.reduce((total, ans) => {
    return total + ans.votes;
  }, 0);
}

export function calcMaxGuesses(answers: RankedVote[]) {
  const totalVote = getTotalVotes(answers);
  const x = answers.map((ans) => {
    const fraction = ans.votes / totalVote;
    return { ...ans, fraction };
  });

  let percent = 0,
    minGuesses = 0;

  for (let ans of x) {
    percent += ans.fraction;
    minGuesses += 1;
    if (percent >= 0.6) break;
  }

  return 20 + Math.floor(minGuesses / 10) * 10;
}

// type ValidationProps = {
//   voteText: string;
//   category: "number" | "word";
//   setEnabled: React.Dispatch<React.SetStateAction<boolean>>;
//   setMsg: React.Dispatch<React.SetStateAction<string>>;
//   setMsgColour: React.Dispatch<React.SetStateAction<string>>;
// };

// export function responseValidation({
//   voteText,
//   category,
//   setEnabled,
//   setMsg,
//   setMsgColour,
// }: ValidationProps) {
//   const containsLetter = !!voteText.match(/[a-zA-Z]/);
//   const containsNumber = !!voteText.match(/\d/);
//   const containsSymbol = !!voteText.match(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/);
//   if (voteText.length < 1 || voteText.length >= 20) {
//     setEnabled(false);
//   } else if (voteText.includes(" ")) {
//     setEnabled(false);
//     setMsg("Response cannot contain a space.");
//     setMsgColour("red");
//   } else if (containsSymbol) {
//     setEnabled(false);
//     setMsg("Response cannot contain a symbol.");
//     setMsgColour("red");
//     // TODO this one might break without "isPlaceholder"
//   } else if (category === "number" && containsLetter) {
//     setEnabled(false);
//     setMsg("This survey only accepts numbers as responses.");
//     setMsgColour("red");
//   } else if (category === "word" && containsNumber) {
//     setEnabled(false);
//     setMsg("This survey does not accept numbers in responses.");
//     setMsgColour("red");
//   } else {
//     setEnabled(true);
//     setMsg("");
//     setMsgColour("auto");
//   }
// }
