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
