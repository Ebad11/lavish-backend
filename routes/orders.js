const express = require("express");
const router = express.Router();
const multer = require("multer");
const orderController = require("../controllers/ordersController");

// Multer temp storage (we’ll send file to Cloudinary later in controller)
const upload = multer({ dest: "uploads/" });

// Create order with optional screenshot upload
router.post("/", upload.single("screenshot"), orderController.create);

module.exports = router;
