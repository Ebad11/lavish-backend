const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  productId: String,
  name: String,
  price: Number,
  quantity: Number,
  image: String,
  category: String,
});

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  items: [OrderItemSchema],

  shippingInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
  },

  upiTransactionId: { type: String, required: true },  // ⭐ NEW FIELD

  subtotal: Number,
  shipping: Number,
  total: Number,
  status: { type: String, default: "pending" },

  paymentScreenshot: String, // screenshot URL
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
