import { createCookie } from "@remix-run/node";
import { COOKIE_SIGNATURE, ROOT_DOMAIN } from "./util/env";

const getDomain = () => {
  if (process.env.NODE_ENV === "production") return "";
  const url = new URL(ROOT_DOMAIN);
  return url.hostname;
};

export const userCookie = createCookie("user", {
  maxAge: 604_800, // one week
  sameSite: "strict",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  expires: new Date(Date.now() + 60_000),
  secrets: [COOKIE_SIGNATURE],
  domain: getDomain(),
});
