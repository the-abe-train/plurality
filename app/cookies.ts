import { createCookie } from "@remix-run/node";
import { COOKIE_SIGNATURE, ROOT_DOMAIN } from "./util/env";

export const userCookie = createCookie("user", {
  maxAge: 604_800, // one week
  sameSite: "lax",
  httpOnly: true,
  secure: true,
  expires: new Date(Date.now() + 60_000),
  secrets: [COOKIE_SIGNATURE],
  domain: ROOT_DOMAIN,
});
