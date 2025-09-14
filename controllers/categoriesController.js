const Category = require("../models/Category");

// GET /api/categories
exports.getAll = async (req, res) => {
  const cats = await Category.find().sort({ name: 1 });
  // also return as string array for your frontend
  res.json(cats.map(c => c.name));
};

// POST /api/categories
exports.create = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "name required" });
  const cat = await Category.findOne({ name });
  if (cat) return res.status(400).json({ error: "category already exists" });
  const created = await Category.create({ name });
  res.status(201).json(created);
};

// DELETE /api/categories/:name
exports.remove = async (req, res) => {
  const { name } = req.params;
  await Category.deleteOne({ name });
  res.json({ ok: true });
};
