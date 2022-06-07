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
