const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/ordersController");

// create order (body: { cartId?, cartItems?, shippingInfo })
router.post("/", ctrl.create);

module.exports = router;
