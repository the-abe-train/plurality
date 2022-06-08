import { genSalt, hash, compare } from "bcryptjs";
import { ObjectId } from "mongodb";
import { client } from "~/db/connect.server";
import {
  createUser,
  userByEmail,
  userByWallet,
  userUpdatePassword,
} from "../db/queries";
// const { genSalt, hash, compare } = bcrypt;

export async function registerUser(email: string, password: string) {
  // Check if user already exists
  const existingUser = await userByEmail(client, email);
  if (existingUser) return { isAuthorized: false, userId: null };

  // Generate salt
  const salt = await genSalt(10);

  // Hash with salt
  const hashedPassword = await hash(password, salt);

  // Store in database
  const user = await createUser(client, email, hashedPassword);

  // Return user from database
  return { isAuthorized: true, userId: user.insertedId };
}

export async function changePassword(email: string, password: string) {
  // Make sure that user already exists
  const existingUser = await userByEmail(client, email);
  if (!existingUser) {
    return {
      message: "No user with this email address exists in the database",
      error: true,
    };
  }

  // Generate salt
  const salt = await genSalt(10);

  // Hash with salt
  const hashedPassword = await hash(password, salt);

  // Change password in database
  const updatedUser = await userUpdatePassword(
    client,
    existingUser._id,
    hashedPassword
  );
  if (!updatedUser) {
    return {
      message: "Password change failed. Please try again.",
      error: true,
    };
  }

  // Return user from database
  return { message: "Password changed successfully.", error: false };
}

export async function authorizeUser(email: string, password: string) {
  // look up user
  // get user password
  // compare password with one in database
  // return boolean of "if password is correct"

  const userData = await userByEmail(client, email);
  if (userData) {
    const savedPassword = userData.password;
    const isAuthorized = await compare(password, savedPassword);
    return { isAuthorized, userId: userData._id };
  }
  return { isAuthorized: false, userId: null };
}

export async function authorizeWallet(userId: ObjectId, wallet: string) {
  const userData = await userByWallet(client, wallet);
  if (userData) {
    const isAuthorized = userId === userData._id;
    return { isAuthorized, userId: userData._id };
  }
  return { isAuthorized: true, userId: null };
}

export async function randomPassword(length: number) {
  // Borrowed from stack overflow
  let password = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    password += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  // Generate salt
  const salt = await genSalt(10);

  // Hash with salt
  const hashedPassword = await hash(password, salt);

  return hashedPassword;
}
