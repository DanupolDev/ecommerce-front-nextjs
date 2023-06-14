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
    event = stripe.webhooks.constructEvent(
      await buffer(req),
      sig,
      endpointSecret
    );
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const data = event.data.object;
      // console.log(data);
      const orderId = data.metadata.orderID;
      const paid = data.payment_status === "paid";
      // console.log("pay:", paid);
      if (orderId && paid) {
        await Order.findByIdAndUpdate(orderId, {
          paid: true,
        });
      }
      // Then define and call a function to handle the event payment_intent.succeeded
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).send("OK");
}

// switch (event.type) {
//   case "checkout.session.completed":
//     const data = event.data.object;
//     // console.log(data);
//     const orderId = data.metadata.orderID;
//     const paid = data.payment_status === "paid";
//     // console.log("pay:", paid);
//     if (orderId && paid) {
//       await Order.findByIdAndUpdate(orderId, {
//         paid: true,
//       });
//     }
//     // Then define and call a function to handle the event payment_intent.succeeded
//     break;
//   // ... handle other event types
//   default:
//     console.log(`Unhandled event type ${event.type}`);
// }

export const config = {
  api: { bodyParser: false },
};

//virtue-heaven-trump-uphold
