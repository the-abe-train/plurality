import { VoteAggregation } from "~/db/schemas";

export type ScorebarProps = {
  points: number;
  score: number;
  guesses: VoteAggregation[];
  win: boolean;
  surveyId: number;
  guessesToWin: number;
  instructions?: boolean;
};
