const Product = require("../models/Product");

// GET /api/products
exports.getAll = async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
};

// GET /api/products/:id
exports.getById = async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ error: "Product not found" });
  res.json(p);
};

// POST /api/products
exports.create = async (req, res) => {
  const payload = req.body;
  const product = await Product.create(payload);
  res.status(201).json(product);
};

// PATCH /api/products/:id
exports.update = async (req, res) => {
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

// DELETE /api/products/:id
exports.remove = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
};
