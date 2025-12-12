const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

// Cloudinary upload using buffer (for Vercel)
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: "lavish_products",
        resource_type: "image",
        quality: "100",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
};

// helper to format product objects
const formatProduct = (p) => ({
  id: p._id.toString(),
  name: p.name,
  price: p.price,
  originalPrice: p.originalPrice,
  category: p.category,
  image: p.image?.url || "",
  images: p.images || [],
  description: p.description,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
  inStock: p.inStock,
});

// GET /api/products
exports.getAll = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products.map(formatProduct));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/products/:id
exports.getById = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ error: "Product not found" });
    res.json(formatProduct(p));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// POST /api/products
exports.create = async (req, res) => {
  try {
    let payload = req.body;

    // Parse JSON if FormData sends string
    if (typeof payload === "string") {
      payload = JSON.parse(payload);
    }

    let uploadedImages = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await uploadToCloudinary(file.buffer);
        uploadedImages.push({
          url: uploaded.secure_url,
          public_id: uploaded.public_id,
        });
      }
    }

    const product = await Product.create({
      ...payload,
      image: uploadedImages[0] || null, // main image
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

    // If new images uploaded, upload them
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await uploadToCloudinary(file.buffer);
        uploadedImages.push({
          url: uploaded.secure_url,
          public_id: uploaded.public_id,
        });
      }
    }

    // If new images exist, override old ones
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

    // delete all Cloudinary images
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

    await Product.findByIdAndDelete(req.params.id);

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
