const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/contactController");

router.post("/", ctrl.submit);

module.exports = router;
