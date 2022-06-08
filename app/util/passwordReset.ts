import { ROOT_DOMAIN } from "./env";
import { createUserVerificationToken } from "./verifyEmail";

export async function createPasswordResetLink(email: string, key: string) {
  try {
    // Create token
    const emailToken = await createUserVerificationToken(email, key);

    // Encode url string
    const URIencodedEmail = encodeURIComponent(email);

    // Return link for verification
    return `${ROOT_DOMAIN}/user/reset/${URIencodedEmail}/${emailToken}`;
  } catch (e) {
    console.log("Failed to send email verification link.");
    console.error(e);
  }
}

export async function passwordResetBody(email: string, key: string) {
  const emailLink = await createPasswordResetLink(email, key);
  return `Hello!

You received this email because you filled out the "Reset Password" form on Plurality.

To reset your account's password, click on the link below.

${emailLink}

Thank you for playing!

 - The Plurality Team`;
}
