import { DATABASE_NAME } from "../util/env";
import { MongoClient, ObjectId, UpdateFilter } from "mongodb";
import { capitalizeFirstLetter, truncateEthAddress } from "~/util/text";
import { randomPassword } from "../util/authorize";
import dayjs from "dayjs";
import { SessionData } from "@remix-run/node";
import Stripe from "stripe";

// Connect database
async function connectDb(client: MongoClient) {
  try {
    await client.db(DATABASE_NAME).command({ ping: 1 });
  } catch {
    await client.connect();
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
    "email.address": email.toLowerCase(),
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
  if (existingUser) return existingUser;

  const modifiedUser = await usersCollection.findOneAndUpdate(
    { _id: id },
    { $set: { email: newData } },
    { upsert: false, returnDocument: "after" }
  );
  return modifiedUser.value;
}

export async function userUpdatePassword(
  client: MongoClient,
  id: ObjectId,
  newPassword: string
) {
  const db = await connectDb(client);
  const usersCollection = db.collection<UserSchema>("users");
  const modifiedUser = await usersCollection.findOneAndUpdate(
    { _id: id },
    { $set: { password: newPassword } },
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
  const password = await randomPassword(10);
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
  console.log(surveyClose);
  const options = surveysCollection.find({
    surveyClose: { $gte: surveyClose },
  });
  const arr = await options.toArray();
  const sorted = arr.sort((a, z) => {
    return dayjs(a.surveyClose).diff(z.surveyClose);
  });
  return sorted[0];
}

export async function surveysByAuthor(client: MongoClient, userId: ObjectId) {
  const db = await connectDb(client);
  const surveysCollection = db.collection<SurveySchema>("surveys");
  return await surveysCollection.find({ "author.user": userId }).toArray();
}

export async function getFutureSurveys(client: MongoClient, userId: ObjectId) {
  const db = await connectDb(client);
  const surveysCollection = db.collection<SurveySchema>("surveys");
  const userGames = await gamesByUser(client, userId);
  const omitSurveys = userGames
    .filter((game) => game.vote)
    .map((game) => game.survey);
  const collection = await surveysCollection
    .find({
      surveyClose: { $gt: dayjs().toDate() },
      $and: [{ _id: { $not: { $in: omitSurveys } } }, { _id: { $gt: 0 } }],
    })
    // .limit(amount)
    .toArray();
  return collection;
}

export async function getAllSurveyIds(client: MongoClient) {
  const db = await connectDb(client);
  const surveysCollection = db.collection<SurveySchema>("surveys");
  const collection = await surveysCollection
    .find({ _id: { $gt: 0 } }, { projection: { _id: 0, surveyClose: 1 } })
    .map((doc) => doc.surveyClose)
    .toArray();
  return collection;
}

type SearchParams = {
  client: MongoClient;
  textSearch: RegExp;
  dateParam: string | null;
  idSearch: number;
  communitySearch: boolean;
  standardSearch: boolean;
};

export async function surveyBySearch({
  client,
  textSearch,
  dateParam,
  idSearch,
  communitySearch,
  standardSearch,
}: SearchParams) {
  const db = await connectDb(client);
  const surveysCollection = db.collection<SurveySchema>("surveys");
  if (!communitySearch && !standardSearch) return [];
  const searchFilter: any[] = [
    { _id: { $gt: 0 } },
    {
      $or: [
        { community: communitySearch },
        { community: { $ne: standardSearch } },
      ],
    },
    {
      $or: [{ text: { $regex: textSearch } }, { _id: idSearch }],
    },
  ];

  if (dateParam) {
    const [year, month, day] = dateParam.split("-").map((str) => Number(str));
    const dateSearch = new Date(
      Date.UTC(year, month - 1, day + 1, 3, 59, 59, 999)
    );
    searchFilter.push({ surveyClose: dateSearch });
  }

  return await surveysCollection.find({ $and: searchFilter }).toArray();
}

// Games collection
export async function votesBySurvey(client: MongoClient, surveyId: number) {
  const db = await connectDb(client);
  const gamesCollection = db.collection<GameSchema>("games");
  const votes = await gamesCollection
    .aggregate<VoteAggregation>([
      {
        $match: {
          survey: surveyId,
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
    ])
    .toArray();
  return votes;
}

type GameProps = {
  client: MongoClient;
  surveyId: number;
  userId: ObjectId;
  win?: boolean;
  guesses?: RankedVote[];
  guessesToWin?: number;
};

export async function gameBySurveyUser({
  client,
  surveyId,
  userId,
  win,
  guesses,
  guessesToWin,
}: GameProps) {
  const db = await connectDb(client);
  const gamesCollection = db.collection<GameSchema>("games");
  const result = await gamesCollection.findOneAndUpdate(
    { survey: surveyId, user: userId },
    {
      $set: { lastUpdated: new Date() },
      $setOnInsert: {
        guesses: guesses || [],
        win: win || false,
        score: 0,
        guessesToWin: guessesToWin || 999,
      },
    },
    { upsert: true, returnDocument: "after" }
  );
  let game = result.value;
  return game;
}

export async function addGuess(
  client: MongoClient,
  gameId: ObjectId,
  guess: RankedVote,
  win: boolean,
  score: number,
  guessesToWin: number
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
  if (!win) delete newData["$min"];
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
  surveyId: number,
  userId: ObjectId,
  voteText: string | number
) {
  const db = await connectDb(client);
  const gamesCollection = db.collection<GameSchema>("games");
  const text =
    typeof voteText === "string" ? capitalizeFirstLetter(voteText) : voteText;
  const updatedGameResult = await gamesCollection.findOneAndUpdate(
    { survey: surveyId, user: userId },
    { $set: { lastUpdated: new Date(), vote: { text, date: new Date() } } },
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

export async function surveyVotes(client: MongoClient, surveyId: number) {
  const db = await connectDb(client);
  const gamesCollection = db.collection<GameSchema>("games");
  const games = await gamesCollection
    .find({ survey: surveyId, vote: { $exists: true } })
    .toArray();
  return games.length;
}

type ScoreDoc = {
  _id: ObjectId;
  score: number;
};

export async function surveyScores(client: MongoClient, surveyId: number) {
  const db = await connectDb(client);
  const gamesCollection = db.collection<GameSchema>("games");
  const scoreDocuments = await gamesCollection
    .aggregate<ScoreDoc>([
      {
        $match: {
          score: {
            $gt: 0,
          },
          survey: surveyId,
        },
      },
      {
        $project: {
          score: "$score",
        },
      },
      {
        $sort: {
          score: 1,
        },
      },
    ])
    .toArray();

  return scoreDocuments.map((doc) => doc.score);
}

export async function deleteGame(
  client: MongoClient,
  user: ObjectId,
  survey: number
) {
  const db = await connectDb(client);
  const gamesCollection = db.collection<GameSchema>("games");
  const filter: UpdateFilter<GameSchema> = {
    user,
    survey,
    vote: { $exists: false },
  };
  if (survey < 1) delete filter["vote"];
  return await gamesCollection.deleteOne(filter);
}

export async function resetGuesses(
  client: MongoClient,
  user: ObjectId,
  survey: number
) {
  const db = await connectDb(client);
  const gamesCollection = db.collection<GameSchema>("games");
  const updateResult = await gamesCollection.updateOne(
    { user, survey },
    {
      $set: {
        score: 0,
        guesses: [],
        guessesToWin: 999,
        win: false,
        lastUpdated: new Date(),
      },
    }
  );
  console.log(`Game id ${JSON.stringify(updateResult)} reset\n`);
  return;
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

// Draft queries
export async function getDrafts(client: MongoClient, user: string) {
  const db = await connectDb(client);
  const draftsCollection = db.collection<DraftSchema>("drafts");
  return await draftsCollection.find({ user: new ObjectId(user) }).toArray();
}

export async function createDraft(
  client: MongoClient,
  session: Stripe.Checkout.Session
) {
  const db = await connectDb(client);
  const draftsCollection = db.collection<DraftSchema>("drafts");
  const { amount_total, currency, metadata } = session;
  const { text, user, photo, category, username } = metadata || {};
  return draftsCollection.insertOne({
    _id: new ObjectId(),
    cost: { amount: amount_total || 0, currency: currency || "" },
    submitted: new Date(),
    status: "Under review",
    text,
    photo,
    category: category as "word" | "number",
    user: new ObjectId(user),
    username,
  });
}
