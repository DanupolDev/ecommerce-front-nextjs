import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";
const stripe = require("stripe")(process.env.STRIPE_SK);
import { buffer } from "micro";

const endpointSecret =
  "whsec_636ebed4255e613099ab66157cb3d2f6f42c70897e40d00c341d27334f907da3";

export default async function handler(req, res) {
  await mongooseConnect();
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event

  console.log(`Unhandled event type ${event.type}`);

  res.status(200).send("OK");
}

export const config = {
  api: { bodyParser: false },
};

//virtue-heaven-trump-uphold
