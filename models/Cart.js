const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  productId: String,
  name: String,
  price: Number,
  originalPrice: Number,
  image: String,
  category: String,
  quantity: { type: Number, default: 1 },
});

const CartSchema = new mongoose.Schema({
  cartId: { type: String, required: true, default: "default" }, // frontend can pass cartId
  items: [CartItemSchema],
}, { timestamps: true });

module.exports = mongoose.model("Cart", CartSchema);
