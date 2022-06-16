import type {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { useState } from "react";

import Footer from "~/components/navigation/Footer";
import Header from "~/components/navigation/Header";
import Tooltip from "~/components/information/Tooltip";
import AnimatedBanner from "~/components/text/AnimatedBanner";
import NavButton from "~/components/buttons/NavButton";

import { DraftSchema, UserSchema } from "~/db/schemas";
import { client } from "~/db/connect.server";
import { getDrafts, userById } from "~/db/queries";
import { ROOT_DOMAIN, STRIPE_SECRET_KEY } from "~/util/env";

import { commitSession, getSession } from "~/sessions";

import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";

import { draftIcon } from "~/images/icons";
import Stripe from "stripe";
import { ObjectId } from "mongodb";
import DraftList from "~/components/lists/DraftList";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: backgrounds },
  ];
};

type LoaderData = {
  user: UserSchema;
  enabled: boolean;
  drafts: DraftSchema[];
  message?: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  // Get user info
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user");

  // Get data from db
  const [user, drafts] = await Promise.all([
    userById(client, userId),
    getDrafts(client, userId),
  ]);

  // Redirect not signed-in users to home page
  if (!user) {
    session.flash("message", "You need to be logged-in to draft a Survey.");
    return redirect("/user/signup", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  // Don't let them submit form if user email address isn't verified
  if (!user.email.verified) {
    const message = "Your email address must be verified to submit a Draft.";
    return json<LoaderData>({ user, message, drafts, enabled: false });
  }

  // Return data
  const data = { user, drafts, enabled: true };
  return json<LoaderData>(data);
};

type ActionData = {
  message: string;
};

export const action: ActionFunction = async ({ request }) => {
  // Async parse form and session data
  const [form, session] = await Promise.all([
    request.formData(),
    getSession(request.headers.get("Cookie")),
  ]);

  // Extract data from form and session
  const text = form.get("question") as string;
  const photo = form.get("photo") as string;
  const category = form.get("category") as string;
  const user = session.get("user") as ObjectId;

  // Create Stripe payment link
  const metadata = { user: user.toString(), text, photo, category };
  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2020-08-27",
  });
  const product = await stripe.products.create({
    name: "Plurality Draft",
    images: [
      "https://plurality.fun/preview.png",
      `https://source.unsplash.com/${photo}`,
    ],
    metadata,
    default_price_data: { currency: "cad", unit_amount: 1000 },
    description: `Thank you for purchasing a Plurality Draft! 
        Once your draft has been approved, your Survey question 
        "${text}" will show up in the queue of the Surveys.
        Return to the Draft page for an update on your draft's status!
        Feel free to contact me if you have any concerns (@theAbeTrain on 
        Twitter).`,
  });
  const price = await stripe.prices.create({
    currency: "cad",
    unit_amount: 1000,
    product: product.id,
    metadata,
  });
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    metadata,
    after_completion: {
      type: "redirect",
      redirect: { url: ROOT_DOMAIN },
    },
  });

  return redirect(paymentLink.url);
};

export default () => {
  const { user, message, drafts, enabled } = useLoaderData<LoaderData>();
  const transition = useTransition();

  return (
    <div className="light w-full top-0 bottom-0 flex flex-col min-h-screen">
      <div className="flex-grow">
        <Header name={user ? user.name : "Connect"} />
        <AnimatedBanner text="Draft" icon={draftIcon} />
        <main
          className="max-w-4xl flex flex-col md:grid grid-cols-2
        gap-4 my-6 justify-center md:mx-auto mx-4"
        >
          <DraftList drafts={drafts} />
          <section className="md:pl-4">
            <h2 className="font-header text-2xl" data-cy="draft-header">
              Draft your Survey question
            </h2>
            <Form method="post" className="my-4 space-y-4">
              <textarea
                className="w-full px-4 py-2 text-sm border border-outline"
                name="question"
                placeholder="Enter question text here."
                minLength={10}
                maxLength={100}
                required
              />
              <div>
                <label
                  htmlFor="photo"
                  className="flex items-center space-x-2 my-1"
                >
                  <p>Unsplash photo ID</p>
                  <Tooltip
                    text="The string of characters at the end of the URL for 
              any photo on unsplash.com"
                  />
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 text-sm border border-outline"
                  name="photo"
                  required
                />
              </div>
              <label htmlFor="category" className="flex items-center space-x-2">
                <p>Select Survey category:</p>
                <select
                  name="category"
                  className="bg-white border border-outline px-1"
                >
                  <option value="word">Word</option>
                  <option value="number">Number</option>
                </select>
              </label>
              <div>
                <button
                  className="gold px-6 py-2 block mx-auto my-6"
                  type="submit"
                  disabled={transition.state !== "idle" || !enabled}
                >
                  Submit
                </button>
              </div>
              <p className="text-red-700">{message}</p>
            </Form>
          </section>
          <section className="md:self-end">
            <div className="flex flex-wrap gap-3 my-3">
              <NavButton name="Guess" />
              <NavButton name="Respond" />
            </div>
            <Link to="/surveys?community=on&standard=on" className="underline">
              Play more Surveys
            </Link>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
};
