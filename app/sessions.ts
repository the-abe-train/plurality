import { Cookie, createSessionStorage } from "@remix-run/node";
import { userCookie } from "./cookies";
import { client } from "./db/connect.server";
import {
  createSession,
  deleteSession,
  readSession,
  updateSession,
} from "./db/queries";

function createDatabaseSessionStorage(cookie: Cookie) {
  return createSessionStorage({
    cookie,
    async createData(data, expiry) {
      const id = createSession(client, data, expiry);
      return id;
    },
    async readData(id) {
      return await readSession(client, id);
    },
    async updateData(id, data, expiry) {
      await updateSession(client, id, data, expiry);
    },
    async deleteData(id) {
      await deleteSession(client, id);
    },
  });
}

const { getSession, commitSession, destroySession } =
  createDatabaseSessionStorage(userCookie);

export { getSession, commitSession, destroySession };
