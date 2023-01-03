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

export function calcMinGuesses(answers: RankedVote[]) {
  const totalVote = getTotalVotes(answers);
  const withFraction = answers.map((ans) => {
    const fraction = ans.votes / totalVote;
    return { ...ans, fraction };
  });

  let percent = 0,
    minGuesses = 0;

  for (let ans of withFraction) {
    percent += ans.fraction;
    minGuesses += 1;
    if (percent >= 0.6) break;
  }
  return minGuesses;
}

export function calcMaxGuesses(answers: RankedVote[]) {
  const minGuesses = calcMinGuesses(answers);
  return 20 + Math.floor(minGuesses / 10) * 10;
}

export function calcTopAnswers(answers: RankedVote[]) {
  const minGuesses = calcMinGuesses(answers);
  const numToReveal = 10 + Math.floor(minGuesses / 10) * 10;
  return answers.slice(0, numToReveal);
}

export function revealResults(
  game: GameSchema,
  maxGuesses: number,
  isAdmin?: boolean
) {
  if (isAdmin) return true;
  const gameOver =
    game.guesses.length >= maxGuesses ||
    game.score === 1 ||
    game.guesses.length >= 30;
  return game.win || gameOver || (game.survey <= 8 && game.guesses.length >= 2);
}
