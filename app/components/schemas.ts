import { VoteAggregation } from "~/db/schemas";

export type ScorebarProps = {
  points: number;
  score: number;
  guesses: VoteAggregation[];
  win: boolean;
  gameOver: boolean;
  surveyId: number;
  guessesToWin: number;
  maxGuesses: number;
  instructions?: boolean;
};

export type UserStats = {
  gamesWon: number;
  responsesSubmitted: number;
  gamesPlayed: number;
  surveysDrafted: number;
  highestScore: { survey: number; score: number };
  fewestGuesses: { survey: number; guesses: number };
};
