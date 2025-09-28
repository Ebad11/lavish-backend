const fs = require("fs");
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

// helper to format product objects
const formatProduct = (p) => ({
  id: p._id.toString(),
  name: p.name,
  price: p.price,
  originalPrice: p.originalPrice,
  category: p.category,
  image: p.image?.url || "",   // main image
  images: p.images || [],      // all images [{url, public_id}]
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

    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await cloudinary.uploader.upload(file.path, {
          folder: "lavish_products",
          resource_type: "image",
          quality: "100", // keep full quality
        });
        uploadedImages.push({
          url: uploaded.secure_url,
          public_id: uploaded.public_id,
        });

        // remove temp file after upload
        fs.unlink(file.path, () => {});
      }
    }

    const product = await Product.create({
      ...payload,
      image: uploadedImages[0] || null, // first image as main
      images: uploadedImages,
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

    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await cloudinary.uploader.upload(file.path, {
          folder: "lavish_products",
          resource_type: "image",
          quality: "100",
        });
        uploadedImages.push({
          url: uploaded.secure_url,
          public_id: uploaded.public_id,
        });

        // remove temp file after upload
        fs.unlink(file.path, () => {});
      }
    }

    if (uploadedImages.length > 0) {
      payload.image = uploadedImages[0];
      payload.images = uploadedImages;
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
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // delete from cloudinary
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        if (img.public_id) {
          try {
            await cloudinary.uploader.destroy(img.public_id);
          } catch (err) {
            console.error("Failed to delete from Cloudinary:", err);
          }
        }
      }
    }

    // finally delete product from DB
    await Product.findByIdAndDelete(req.params.id);

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
