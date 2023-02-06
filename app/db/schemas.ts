import { ObjectId } from "mongodb";

declare global {
  type Email = {
    address: string;
    verified: boolean;
  };

  type UserSchema = {
    _id: ObjectId;
    email: Email;
    password: string;
    name: string;
    wallet?: string;
    createdDate: Date;
    lastUpdated: Date;
  };

  type SessionSchema = {
    _id?: ObjectId;
    data?: any;
    user?: string;
    expiry?: Date;
  };

  type SurveySchema = {
    _id: number;
    text: string;
    photo: string;
    surveyClose: Date;
    drafted: Date;
    community: boolean;
    category: "number" | "word";
    author?: {
      user: ObjectId;
      name: string;
    };
  };

  type GameSchema = {
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

  type DraftSchema = {
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
    username: string;
  };

  type CoverSchema = {
    _id: ObjectId;
    survey: number;
    fileName: string;
    photo: string;
    lastUpdated: Date;
    image: Uint8Array;
  };

  type VoteAggregation = {
    _id: string;
    votes: number;
  };

  type RankedVote = {
    _id: string;
    votes: number;
    ranking: number;
  };
}
