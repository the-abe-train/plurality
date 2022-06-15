import { ActionFunction } from "@remix-run/node";
import Stripe from "stripe";
import { STRIPE_ENDPOINT_SECRET, STRIPE_SECRET_KEY } from "~/util/env";

export const action: ActionFunction = async ({ request }) => {
  console.log("Webhook test");
  console.log(request.headers);

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
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log("Payment intent succeeded!");
      console.log(paymentIntent);
      // Then define and call a function to handle the event payment_intent.succeeded
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  throw new Response("Webhook successful!", {
    status: 200,
  });
};
