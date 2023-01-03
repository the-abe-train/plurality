import { MongoClient, MongoClientOptions, ObjectId } from "mongodb";
import { MONGO_URL } from "../util/env";

interface Options extends MongoClientOptions {
  useNewUrlParser: boolean;
}

let client: MongoClient;

declare global {
  var __client: MongoClient | undefined;
  var __MONGO_URL__: string;
}

const options: Options = { useNewUrlParser: true };

if (process.env.NODE_ENV === "production") {
  client = new MongoClient(MONGO_URL, options);
} else if (process.env.NODE_ENV === "test") {
  client = new MongoClient(global.__MONGO_URL__, options);
} else {
  if (!global.__client) {
    global.__client = new MongoClient(MONGO_URL, options);
  }
  client = global.__client;
}

export { client };

export function checkAdmin(userId: any) {
  return new ObjectId("628dcc247386837086138963").equals(userId);
}
