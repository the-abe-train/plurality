import crypto from "crypto";
import { ROOT_DOMAIN } from "./env";

export async function createUserVerificationToken(email: string, key: string) {
  try {
    // Auth string, JWT signature, email
    const authString = `${key}:${encodeURIComponent(email)}`;
    return crypto.createHash("sha256").update(authString).digest("hex");
  } catch (e) {
    console.log("Failed to create user verification token.");
    console.error(e);
  }
}

async function createVerifyEmailLink(email: string, key: string) {
  try {
    // Create token
    const emailToken = await createUserVerificationToken(email, key);

    // Encode url string
    const URIencodedEmail = encodeURIComponent(email);

    // Return link for verification
    return `${ROOT_DOMAIN}/verify/${URIencodedEmail}/${emailToken}`;
  } catch (e) {
    console.log("Failed to send email verification link.");
    console.error(e);
  }
}

export async function verifyEmailBody(email: string, key: string) {
  const emailLink = await createVerifyEmailLink(email, key);
  return `Hello!

You received this email because you clicked the "Verify" button on the Plurality user page.

To verify your account's email address, click on the link below.

${emailLink}

If you have any questions, you can reply to this email.

Thank you for playing!

 - The Plurality Team`;
}
