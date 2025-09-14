const Cart = require("../models/Cart");

/**
 * Helpers:
 * - cartId is optional. If not provided, we use "default".
 * - API endpoints support the same URLs your frontend expects:
 *   POST /api/cart/add  { cartId?, product }
 *   PATCH /api/cart/update/:productId  body: { cartId?, quantity }
 *   DELETE /api/cart/remove/:productId?cartId=...
 *   POST /api/cart/clear { cartId? }
 *   GET /api/cart/:cartId?  -> returns cart
 */

const DEFAULT_CART = "default";

async function getCart(cartId = DEFAULT_CART) {
  let cart = await Cart.findOne({ cartId });
  if (!cart) {
    cart = await Cart.create({ cartId, items: [] });
  }
  return cart;
}

exports.get = async (req, res) => {
  const cartId = req.params.cartId || req.query.cartId || DEFAULT_CART;
  const cart = await getCart(cartId);
  res.json(cart);
};

exports.add = async (req, res) => {
  const cartId = req.body.cartId || DEFAULT_CART;
  const product = req.body.product;
  if (!product || !product.id) return res.status(400).json({ error: "product required with id" });

  const cart = await getCart(cartId);
  const existing = cart.items.find(it => it.productId === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.items.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      category: product.category,
      quantity: 1,
    });
  }
  await cart.save();
  res.json(cart);
};

exports.update = async (req, res) => {
  const productId = req.params.productId;
  const { quantity, cartId } = { ...req.body, ...req.query, cartId: req.body.cartId || req.query.cartId };
  const cid = cartId || DEFAULT_CART;
  if (quantity === undefined) return res.status(400).json({ error: "quantity required" });

  const cart = await getCart(cid);
  const idx = cart.items.findIndex(it => it.productId === productId);
  if (idx === -1) return res.status(404).json({ error: "item not found" });

  if (quantity <= 0) {
    cart.items.splice(idx, 1);
  } else {
    cart.items[idx].quantity = quantity;
  }
  await cart.save();
  res.json(cart);
};

exports.remove = async (req, res) => {
  const productId = req.params.productId;
  const cartId = req.query.cartId || req.body.cartId || DEFAULT_CART;

  const cart = await getCart(cartId);
  cart.items = cart.items.filter(it => it.productId !== productId);
  await cart.save();
  res.json(cart);
};

exports.clear = async (req, res) => {
  const cartId = req.body.cartId || req.query.cartId || DEFAULT_CART;
  let cart = await Cart.findOne({ cartId });
  if (!cart) {
    cart = await Cart.create({ cartId, items: [] });
  } else {
    cart.items = [];
    await cart.save();
  }
  res.json(cart);
};
