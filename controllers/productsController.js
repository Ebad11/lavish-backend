const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

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
  inStock: p.inStock,
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
  try {
    let payload = req.body;

    // Parse JSON if sent via FormData
    if (typeof payload === "string") {
      payload = JSON.parse(payload);
    }

    // Upload image if provided
    let imageUrl = null;
    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        folder: "lavish_products",
        resource_type: "image", // keep original type
        quality: "100", // force full quality
      });
      imageUrl = uploaded.secure_url;
    }

    const product = await Product.create({
      ...payload,
      image: imageUrl,
    });

    res.status(201).json(formatProduct(product));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// PATCH /api/products/:id
exports.update = async (req, res) => {
  try {
    let payload = req.body;

    // Upload new image if provided
    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        folder: "lavish_products",
        resource_type: "image", // keep original type
        quality: "100", // full quality
      });
      payload.image = uploaded.secure_url;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true,
    });
    if (!updated) return res.status(404).json({ error: "Product not found" });

    res.json(formatProduct(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE /api/products/:id
exports.remove = async (req, res) => {
  const deleted = await Product.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Product not found" });
  res.json({ ok: true });
};
