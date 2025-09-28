const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    // store both URL and public_id for Cloudinary images
    image: {
      url: { type: String, default: "" }, // main image URL
      public_id: { type: String, default: "" }, // main image Cloudinary ID
    },
    images: [
      {
        url: { type: String, required: true }, // image URL
        public_id: { type: String, required: true }, // image Cloudinary ID
      },
    ],
    category: { type: String, required: true },
    isNew: { type: Boolean, default: false },
    isSale: { type: Boolean, default: false },
    sizes: [{ type: String }],
    description: { type: String },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
