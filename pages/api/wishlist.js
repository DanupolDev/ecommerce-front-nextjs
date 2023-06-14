import { mongooseConnect } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { WishedProduct } from "@/models/WishedProducts";

export default async function handle(req, res) {
  await mongooseConnect();
  const { user } = await getServerSession(req, res, authOptions);
  if (req.method === "POST") {
    const { productId } = req.body;
    const wishedDoc = await WishedProduct.findOne({
      userEmail: user.email,
      product: productId,
    });
    if (wishedDoc) {
      await WishedProduct.findByIdAndDelete(wishedDoc._id);
      res.json("deleted");
    } else {
      await WishedProduct.create({ userEmail: user.email, product: productId });
      res.json("created");
    }
  }
  if (req.method === "GET") {
    res.json(
      await WishedProduct.find({ userEmail: user.email }).populate("product")
    );
  }
}
