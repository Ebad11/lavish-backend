const express = require("express");
const router = express.Router();
const multer = require("multer");
const orderController = require("../controllers/ordersController");

// Multer memory storage (Vercel requires this)
const upload = multer({ storage: multer.memoryStorage() });

// Create order with optional screenshot upload
router.post("/", upload.single("screenshot"), orderController.create);

module.exports = router;
