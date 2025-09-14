const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/cartController");

// get cart (with or without cartId)
router.get("/", ctrl.get);          // when no cartId provided
router.get("/:cartId", ctrl.get);   // when cartId provided

// add to cart (body: { cartId?, product })
router.post("/add", ctrl.add);

// update quantity PATCH /api/cart/update/:productId body: { quantity, cartId? }
router.patch("/update/:productId", ctrl.update);

// remove item DELETE /api/cart/remove/:productId?cartId=...
router.delete("/remove/:productId", ctrl.remove);

// clear cart POST /api/cart/clear { cartId? }
router.post("/clear", ctrl.clear);

module.exports = router;
