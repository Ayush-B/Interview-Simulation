const express = require("express");
const { getRandomQuestion } = require("../controllers/questionController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/random", requireAuth, getRandomQuestion);

module.exports = router;
