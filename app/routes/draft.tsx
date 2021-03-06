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

import Footer from "~/components/navigation/Footer";
import Header from "~/components/navigation/Header";
import Tooltip from "~/components/information/Tooltip";
import AnimatedBanner from "~/components/text/AnimatedBanner";
import MiniNav from "~/components/navigation/MiniNav";

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
import { NAME_LENGTH } from "~/util/gameplay";

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

type ActionData = { message: string };

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
  const username = form.get("username") as string;
  const user = session.get("user") as ObjectId;

  // Create Stripe payment link
  try {
    const metadata = { user: user.toString(), text, photo, category, username };
    console.log("New draft:", metadata);
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2020-08-27",
    });
    const product = await stripe.products.create({
      name: "Plurality Draft",
      images: ["https://plurality.fun/preview.png"],
      metadata,
      default_price_data: { currency: "cad", unit_amount: 500 },
      description: `Thank you for purchasing a Plurality Draft! 
          Once your draft has been approved, your Survey question 
          "${text}" will show up in the queue of the Surveys.
          Return to the Draft page for an update on your draft's status!
          If you have any questions or concerns, feel free to contact me 
          through my website (the-abe-train.com) or Twitter (@theAbeTrain).`,
    });
    const price = await stripe.prices.create({
      currency: "cad",
      unit_amount: 500,
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
  } catch (e) {
    const message = "Failed to create payment link. Please try again later.";
    console.log(message);
    return json<ActionData>({ message });
  }
};

// TODO survey should status "scheduled" should be determined automatically
// with db data

export default () => {
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const { user, drafts, enabled } = loaderData;
  const message = actionData?.message || loaderData.message;
  const transition = useTransition();

  return (
    <div className="light w-full top-0 bottom-0 flex flex-col min-h-screen">
      <Header name={user.name} />
      <div className="flex-grow">
        <AnimatedBanner text="Draft" icon={draftIcon} />
        <main
          className="max-w-4xl flex flex-col md:grid grid-cols-2
        gap-4 my-6 justify-center mx-auto px-4"
        >
          <section className="space-y-5">
            <div>
              <h2 className="font-header text-2xl">Instructions</h2>
              <p className="my-3">
                If you enjoy playing Plurality, and would like to give the game
                your own personal twist, buy a draft! Use this form to draft a
                Survey question for an upcoming game. Drafting costs $5, and
                it's the best way to support Plurality and its creator.
              </p>
            </div>
            <DraftList drafts={drafts} />
          </section>
          <section className="md:pl-4">
            <h2 className="font-header text-2xl" data-cy="draft-header">
              Draft your Survey question
            </h2>
            <Form
              method="post"
              className="my-4 space-y-6"
              name="draft"
              data-netlify="true"
            >
              <textarea
                className="w-full px-2 py-2 text-sm border border-outline"
                name="question"
                placeholder="Enter question text here."
                minLength={10}
                maxLength={100}
                data-cy="text-input"
                required
              />
              <div>
                <label
                  htmlFor="photo"
                  className="flex items-center space-x-2 mb-1"
                >
                  <p>
                    Optional: Choose a cover photo from{" "}
                    <a href="https://unsplash.com" className="underline">
                      Unsplash
                    </a>
                  </p>
                  <Tooltip
                    text="The string of characters at the end of the URL for 
              any photo on unsplash.com"
                  />
                </label>
                <input
                  type="text"
                  className="w-full px-2 py-2 text-sm border border-outline"
                  name="photo"
                  data-cy="photo-input"
                  placeholder="Unsplash photo ID"
                />
              </div>
              <div>
                <label>
                  Your display name{" "}
                  <input
                    type="text"
                    name="username"
                    placeholder={user.name}
                    maxLength={NAME_LENGTH}
                    required
                    className="w-full px-2 py-2 text-sm border border-outline"
                  />
                </label>
              </div>
              <div>
                <p className="my-1">
                  Will the responses to your Survey be words or numbers?
                </p>
                <div className="flex space-x-8">
                  <div className="inline-flex justify-around items-center space-x-1 w-fit">
                    <input
                      type="radio"
                      id="word"
                      name="category"
                      value="word"
                      className="accent-accent"
                      defaultChecked
                    />
                    <label htmlFor="word">Words</label>
                  </div>
                  <div className="inline-flex justify-around items-center space-x-1 w-fit">
                    <input
                      type="radio"
                      id="number"
                      name="category"
                      className="accent-accent"
                      value="number"
                    />
                    <label htmlFor="number">Numbers</label>
                  </div>
                </div>
              </div>

              <button
                className="gold px-6 py-2 block mx-auto my-6"
                type="submit"
                disabled={transition.state !== "idle" || !enabled}
              >
                Submit
              </button>
              <p className="text-red-700">{message}</p>
              {!user.email.verified && (
                <Link to="/user" className="text-red-700 underline">
                  Head to the profile page to verify your email.
                </Link>
              )}
            </Form>
          </section>
          <section className="md:self-end">
            <MiniNav page="draft" />
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
};
