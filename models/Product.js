const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  image: { type: String, default: "" },
  images: [{ type: String }],
  category: { type: String, required: true },
  isNew: { type: Boolean, default: false },
  isSale: { type: Boolean, default: false },
  sizes: [{ type: String }],
  description: { type: String },
  inStock: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Product", ProductSchema);
