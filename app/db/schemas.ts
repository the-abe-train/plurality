import { ObjectId } from "mongodb";
import Stripe from "stripe";

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
  category: "number" | "word";
  author?: ObjectId;
};

export type GameSchema = {
  _id: ObjectId;
  survey: number;
  user: ObjectId;
  guesses: RankedVote[];
  win?: boolean;
  vote?: {
    text: string | number;
    date: Date;
  };
  lastUpdated: Date;
  score: number;
  guessesToWin: number;
};

export type DraftSchema = {
  _id: ObjectId;
  text: string;
  photo: string;
  category: "number" | "word";
  user: ObjectId;
  status:
    | "Under review"
    | "Approved"
    | "Scheduled"
    | "Open"
    | "Closed"
    | "Purchase incomplete";
  submitted: Date;
  cost: {
    amount: number;
    currency: string;
  };
};

export type VoteAggregation = {
  _id: string;
  votes: number;
};

export type RankedVote = {
  _id: string;
  votes: number;
  ranking: number;
};
