const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/categoriesController");

router.get("/", ctrl.getAll);
router.post("/", ctrl.create);
router.delete("/:name", ctrl.remove);

module.exports = router;
