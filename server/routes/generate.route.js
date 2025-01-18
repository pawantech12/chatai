const express = require("express");
const { generateResponse } = require("../controllers/generate.controller");
const router = express.Router();

router.route("/generate").post(generateResponse);

module.exports = router;
