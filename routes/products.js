const express = require("express");
const router = express.Router();
const productController = require("../controllers/productsController");
const multer = require("multer");

// use multer for file uploads
const upload = multer({ dest: "uploads/" });

router.get("/", productController.getAll);
router.get("/:id", productController.getById);
router.post("/", upload.single("image"), productController.create);
router.patch("/:id", upload.single("image"), productController.update);
router.delete("/:id", productController.remove);

module.exports = router;
