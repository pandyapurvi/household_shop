import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Cart from "../../models/Cart";
import connectDb from "../../utils/connectDb";

connectDb()

export default async (req, res) => {
  switch (req.method) {
    case "GET":
      await handleGetRequest(req, res);
      break;
    case "PUT":
      await handlePutRequest(req, res);
      break;
    default:
      res.status(405).send(`Method ${req.method} not allowed`)
      break;
  }
}

async function handleGetRequest(req, res) {
  if (!req.headers.authorization) {
    return res.this.status(401).send("No authorization token")
  }
  try {
    t
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "products.product",
      model:"Product"
   })
    res.status(200).send(cart.products)
  } catch (error) {
    console.log(error)
    res.status(403).send("Please login again")
  }
}

async function handlePutRequest(req, res) {
  const { quantity, productId } = req.body
  if (!req.headers.authorization) {
    return res.this.status(401).send("No authorization token")
  }
  try {
    const { userId } = jwt.verify(req.headers.authorization, process.env.JWT_SECRET)
    //Get user cart by userId
    const cart = await Cart.findOne({ user: userId })

    //Check if product already exists in cart
    const productExists = Cart.products.some(doc => ObjectId(productId).equals(doc.product))
    //if so, increment quantity (by number provided to request)
    if (productExists) {
      await Cart.findOneAndUpdate(
        { _id: cart._id, "products.product": productId },
        { $inc: { "products.$.quantity": quantity }}
      )
    } else {
      //if not, add new product with given quantity
      const newProduct = { quantity, product: productId }
      await Cart.findOneAndUpdate(
        { _id: cart._id },
        { $addToSet: { products: newProduct }}
      )
    }
    res.status(200).send("cart updated")
    
  } catch (error) {
    console.log(error)
    res.status(403).send("Please login again")
  }
}