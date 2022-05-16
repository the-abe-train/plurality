import crypto from "crypto";
import { ROOT_DOMAIN, JWT_SIGNATURE } from "./env";

export async function createVerifyEmailToken(email: string) {
  try {
    // Auth string, JWT signature, email
    const authString = `${JWT_SIGNATURE}:${email}`;
    return crypto.createHash("sha256").update(authString).digest("hex");
  } catch (e) {
    console.log("Failed to send email verification link.");
    console.error(e);
  }
}

export async function createVerifyEmailLink(email: string) {
  try {
    // Create token
    const emailToken = await createVerifyEmailToken(email);

    // Encode url string
    const URIencodedEmail = encodeURIComponent(email);

    // Return link for verification
    return `${ROOT_DOMAIN}/verify/${URIencodedEmail}/${emailToken}`;
  } catch (e) {
    console.log("Failed to send email verification link.");
    console.error(e);
  }
}
