import { createCookie } from "@remix-run/node";
import { COOKIE_SIGNATURE, ROOT_DOMAIN } from "./util/env";

export const userCookie = createCookie("user", {
  maxAge: 604_800, // one week
  sameSite: "strict",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  expires: new Date(Date.now() + 60_000),
  secrets: [COOKIE_SIGNATURE],
  domain: process.env.NODE_ENV === "production" ? ROOT_DOMAIN : "",
});
