import { ObjectId } from "mongodb";

type Email = {
  address: string;
  verified: boolean;
};

export type UserSchema = {
  _id: ObjectId;
  email: Email;
  password: string;
  name: string;
  wallet?: string;
  createdDate: Date;
  lastUpdated: Date;
};

export type SessionSchema = {
  _id?: ObjectId;
  data?: any;
  user?: string;
  expiry?: Date;
};

export type SurveySchema = {
  _id: number;
  text: string;
  photo: string;
  surveyClose: Date;
  drafted: Date;
  community: boolean;
  author?: ObjectId;
};

export type GameSchema = {
  _id: ObjectId;
  question: number;
  user: ObjectId;
  guesses: VoteAggregation[];
  win?: boolean;
  vote?: {
    text: string;
    date: Date;
  };
  totalVotes: number;
  lastUpdated: Date;
  score: number;
  guessesToWin?: number;
};

export type VoteAggregation = {
  _id: string;
  votes: number;
  ranking: number;
};
