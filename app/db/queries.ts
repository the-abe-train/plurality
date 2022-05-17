import {
  SurveySchema,
  VoteAggregation,
  UserSchema,
  GameSchema,
  SessionSchema,
} from "./schemas";
import { DATABASE_NAME } from "../util/env";
import { MongoClient, ObjectId, UpdateFilter } from "mongodb";
import { capitalizeFirstLetter, truncateEthAddress } from "~/util/text";
import { randomPassword } from "../util/authorize";
import dayjs from "dayjs";
import { SessionData } from "@remix-run/node";

// Connect database
async function connectDb(client: MongoClient) {
  try {
    await client.db(DATABASE_NAME).command({ ping: 1 });
  } catch {
    await client.connect();
    console.log("Connected to DB success 🗃");
  }
  const db = client.db(DATABASE_NAME);
  return db;
}

// Users collection
export async function userById(client: MongoClient, id: ObjectId) {
  const db = await connectDb(client);
  const usersCollection = db.collection<UserSchema>("users");
  return await usersCollection.findOne({
    _id: id,
  });
}

export async function userByEmail(client: MongoClient, email: string) {
  const db = await connectDb(client);
  const usersCollection = db.collection<UserSchema>("users");
  return await usersCollection.findOne({
    "email.address": email,
  });
}

export async function userByWallet(client: MongoClient, wallet: string) {
  const db = await connectDb(client);
  const usersCollection = db.collection<UserSchema>("users");
  return await usersCollection.findOne({ wallet });
}

export async function userUpdateWallet(
  client: MongoClient,
  id: ObjectId,
  wallet: string
) {
  const db = await connectDb(client);
  const usersCollection = db.collection<UserSchema>("users");
  const modifiedUser = await usersCollection.findOneAndUpdate(
    { _id: id },
    { $set: { wallet } },
    { upsert: false, returnDocument: "after" }
  );
  return modifiedUser.value;
}

export async function removeWallet(client: MongoClient, id: ObjectId) {
  const db = await connectDb(client);
  const usersCollection = db.collection<UserSchema>("users");
  const modifiedUser = await usersCollection.findOneAndUpdate(
    { _id: id },
    { $set: { wallet: "" } },
    { upsert: false, returnDocument: "after" }
  );
  return modifiedUser.value;
}

export async function userUpdateName(
  client: MongoClient,
  id: ObjectId,
  newName: string
) {
  const db = await connectDb(client);
  const usersCollection = db.collection<UserSchema>("users");
  const modifiedUser = await usersCollection.findOneAndUpdate(
    { _id: id },
    { $set: { name: newName } },
    { upsert: false, returnDocument: "after" }
  );
  return modifiedUser.value;
}

export async function userUpdateEmail(
  client: MongoClient,
  id: ObjectId,
  newEmail: string
) {
  const db = await connectDb(client);
  const usersCollection = db.collection<UserSchema>("users");
  const newData = { address: newEmail, verified: false };

  // First make sure no one already has this email address
  const existingUser = await userByEmail(client, newEmail);
  console.log(existingUser);
  if (existingUser) return existingUser;

  const modifiedUser = await usersCollection.findOneAndUpdate(
    { _id: id },
    { $set: { email: newData } },
    { upsert: false, returnDocument: "after" }
  );
  return modifiedUser.value;
}

export async function createUser(
  client: MongoClient,
  email: string,
  password: string
) {
  const db = await connectDb(client);
  const usersCollection = db.collection<UserSchema>("users");
  const user = await usersCollection.insertOne({
    _id: new ObjectId(),
    email: {
      address: email,
      verified: false,
    },
    name: email,
    password,
    createdDate: new Date(),
    lastUpdated: new Date(),
  });
  return user;
}

export async function connectUserWallet(client: MongoClient, wallet: string) {
  const db = await connectDb(client);
  const usersCollection = db.collection<UserSchema>("users");
  const password = await randomPassword(8);
  const user = await usersCollection.findOneAndUpdate(
    { wallet },
    {
      $set: { lastUpdated: new Date() },
      $setOnInsert: {
        _id: new ObjectId(),
        email: {
          address: "example@walletholder.com",
          verified: false,
        },
        name: truncateEthAddress(wallet),
        password,
        createdDate: new Date(),
      },
    },
    { upsert: true, returnDocument: "after" }
  );
  return user;
}

export async function verifyUser(client: MongoClient, address: string) {
  const db = await connectDb(client);
  const usersCollection = db.collection<UserSchema>("users");
  const user = await usersCollection.findOneAndUpdate(
    { "email.address": address },
    {
      $set: { lastUpdated: new Date(), "email.verified": true },
    },
    { upsert: false, returnDocument: "after" }
  );
  return user;
}

export async function deleteUser(client: MongoClient, id: ObjectId) {
  const db = await connectDb(client);
  const usersCollection = db.collection<UserSchema>("users");
  return await usersCollection.deleteOne({ _id: id });
}

// Surveys collection
export async function surveyById(client: MongoClient, id: number) {
  const db = await connectDb(client);
  const surveysCollection = db.collection<SurveySchema>("surveys");
  return await surveysCollection.findOne({
    _id: id,
  });
}

export async function surveyByClose(client: MongoClient, surveyClose: Date) {
  const db = await connectDb(client);
  const surveysCollection = db.collection<SurveySchema>("surveys");
  return await surveysCollection.findOne({
    surveyClose: surveyClose,
  });
}

export async function surveysByAuthor(client: MongoClient, userId: ObjectId) {
  const db = await connectDb(client);
  const surveysCollection = db.collection<SurveySchema>("surveys");
  return await surveysCollection.find({ author: userId }).toArray();
}

export async function getFutureSurveys(client: MongoClient, userId: ObjectId) {
  const db = await connectDb(client);
  const surveysCollection = db.collection<SurveySchema>("surveys");
  const userGames = await gamesByUser(client, userId);
  const omitSurveys = userGames
    .filter((game) => game.vote)
    .map((game) => game.question);
  const collection = await surveysCollection
    .find({
      surveyClose: { $gt: dayjs().toDate() },
      _id: { $not: { $in: omitSurveys } },
    })
    // .limit(amount)
    .toArray();
  return collection;
}

type SearchParams = {
  client: MongoClient;
  textSearch: RegExp;
  dateSearch: Date;
  idSearch: number;
  communitySearch: boolean;
  standardSearch: boolean;
};

export async function surveyBySearch({
  client,
  textSearch,
  dateSearch,
  idSearch,
  communitySearch,
  standardSearch,
}: SearchParams) {
  const db = await connectDb(client);
  const surveysCollection = db.collection<SurveySchema>("surveys");
  if (!communitySearch && !standardSearch) return [];
  return await surveysCollection
    .find({
      $and: [
        {
          $or: [
            { text: { $regex: textSearch } },
            { _id: idSearch },
            { surveyClose: dateSearch },
          ],
        },
        {
          $or: [
            { community: communitySearch },
            { community: { $ne: standardSearch } },
          ],
        },
      ],
    })
    .toArray();
}

// Games collection
export async function votesBySurvey(client: MongoClient, surveyId: number) {
  const db = await connectDb(client);
  const gamesCollection = db.collection<GameSchema>("games");
  const votes = await gamesCollection
    .aggregate([
      {
        $match: {
          question: surveyId,
          vote: {
            $exists: true,
          },
        },
      },
      {
        $group: {
          _id: "$vote.text",
          votes: {
            $count: {},
          },
        },
      },
      {
        $setWindowFields: {
          partitionBy: "_id",
          sortBy: {
            votes: -1,
          },
          output: {
            ranking: {
              $rank: {},
            },
          },
        },
      },
    ])
    .toArray();
  return votes as VoteAggregation[];
}

type GameProps = {
  client: MongoClient;
  surveyId: number;
  userId: ObjectId;
  totalVotes?: number;
  win?: boolean;
  guesses?: VoteAggregation[];
};

export async function gameBySurveyUser({
  client,
  surveyId,
  userId,
  totalVotes,
  win,
  guesses,
}: GameProps) {
  const db = await connectDb(client);
  const gamesCollection = db.collection<GameSchema>("games");
  const result = await gamesCollection.findOneAndUpdate(
    { question: surveyId, user: userId },
    {
      $set: { lastUpdated: new Date() },
      $setOnInsert: { guesses: guesses || [], win: win || false, score: 0 },
      $max: { totalVotes },
    },
    { upsert: true, returnDocument: "after" }
  );
  let game = result.value;
  return game;
}

export async function addGuess(
  client: MongoClient,
  gameId: ObjectId,
  guess: VoteAggregation,
  win: boolean,
  score: number,
  guessesToWin?: number
) {
  const db = await connectDb(client);
  const gamesCollection = db.collection<GameSchema>("games");
  const newData: UpdateFilter<GameSchema> = {
    $set: {
      lastUpdated: new Date(),
      win,
      score,
    },
    $push: { guesses: guess },
    $min: { guessesToWin },
  };
  if (!guessesToWin) delete newData["$min"];
  const updatedGameResult = await gamesCollection.findOneAndUpdate(
    { _id: gameId },
    newData,
    { upsert: true, returnDocument: "after" }
  );
  const updatedGame = updatedGameResult.value;
  return updatedGame;
}

export async function addVote(
  client: MongoClient,
  gameId: ObjectId,
  voteText: string
) {
  const db = await connectDb(client);
  const gamesCollection = db.collection<GameSchema>("games");
  const updatedGameResult = await gamesCollection.findOneAndUpdate(
    { _id: gameId },
    {
      $set: {
        lastUpdated: new Date(),
        vote: {
          text: capitalizeFirstLetter(voteText),
          date: new Date(),
        },
      },
    },
    { upsert: false, returnDocument: "after" }
  );
  const updatedGame = updatedGameResult.value;
  return updatedGame;
}

export async function gamesByUser(client: MongoClient, userId: ObjectId) {
  const db = await connectDb(client);
  const gamesCollection = db.collection<GameSchema>("games");
  const games = await gamesCollection.find({ user: userId }).toArray();
  return games;
}

// Session queries
export async function createSession(
  client: MongoClient,
  data: SessionData,
  expiry?: Date
) {
  const db = await connectDb(client);
  const sessionsCollection = db.collection<SessionSchema>("sessions");
  const result = await sessionsCollection.insertOne({ ...data, expiry });
  const id = result.insertedId.toString();
  return id;
}

export async function readSession(client: MongoClient, id: string) {
  const db = await connectDb(client);
  const sessionsCollection = db.collection<SessionSchema>("sessions");
  return (await sessionsCollection.findOne({ _id: new ObjectId(id) })) || null;
}

export async function updateSession(
  client: MongoClient,
  id: string,
  data: SessionData,
  expiry?: Date
) {
  const db = await connectDb(client);
  const sessionsCollection = db.collection<SessionSchema>("sessions");
  await sessionsCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...data, expiry } },
    { upsert: true }
  );
}

export async function deleteSession(client: MongoClient, id: string) {
  const db = await connectDb(client);
  const sessionsCollection = db.collection<SessionSchema>("sessions");
  await sessionsCollection.findOneAndDelete({ _id: new ObjectId(id) });
}
