import { ActionFunction } from "@remix-run/node";
import Stripe from "stripe";
import { client } from "~/db/connect.server";
import { createDraft } from "~/db/queries";
import { STRIPE_ENDPOINT_SECRET, STRIPE_SECRET_KEY } from "~/util/env";

export const action: ActionFunction = async ({ request }) => {
  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2020-08-27",
  });

  const sig = request.headers.get("stripe-signature") || "";
  const buf = Buffer.from(await request.arrayBuffer());

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, STRIPE_ENDPOINT_SECRET);
  } catch (err: any) {
    console.log(err.message);
    throw new Response(`Webhook Error: ${err}`, {
      status: 400,
    });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      await createDraft(client, checkoutSession);
      break;
    case "payment_intent.succeeded":
      console.log("Payment intent succeeded!");
      break;
    case "payment_intent.created":
      console.log("Payment intent created!");
      break;
    case "price.created":
      console.log("Price created!");
      break;
    case "product.created":
      console.log("Product created!");
      break;
    case "payment_link.created":
      console.log("Payment link created!");
      break;
    case "charge.succeeded":
      console.log("Charge succeeded!");
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  throw new Response("Webhook successful!", {
    status: 200,
  });
};
