const Product = require("../models/Product");

// helper to format product objects
const formatProduct = (p) => ({
  id: p._id.toString(),
  name: p.name,
  price: p.price,
  category: p.category,
  image: p.image,
  description: p.description,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
  inStock: p.inStock
});

// GET /api/products
exports.getAll = async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products.map(formatProduct));
};

// GET /api/products/:id
exports.getById = async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ error: "Product not found" });
  res.json(formatProduct(p));
};

// POST /api/products
exports.create = async (req, res) => {
  const payload = req.body;
  const product = await Product.create(payload);
  res.status(201).json(formatProduct(product));
};

// PATCH /api/products/:id
exports.update = async (req, res) => {
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ error: "Product not found" });
  res.json(formatProduct(updated));
};

// DELETE /api/products/:id
exports.remove = async (req, res) => {
  const deleted = await Product.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Product not found" });
  res.json({ ok: true });
};
