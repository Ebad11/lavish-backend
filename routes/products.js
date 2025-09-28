const express = require("express");
const router = express.Router();
const productController = require("../controllers/productsController");
const multer = require("multer");

// use multer for file uploads
const upload = multer({ dest: "uploads/" });

// fetch all products
router.get("/", productController.getAll);

// fetch single product
router.get("/:id", productController.getById);

// create product with multiple images
router.post("/", upload.array("images", 10), productController.create);

// update product with multiple images
router.patch("/:id", upload.array("images", 10), productController.update);

// delete product
router.delete("/:id", productController.remove);

module.exports = router;
