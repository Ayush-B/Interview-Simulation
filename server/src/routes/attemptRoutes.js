const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { submitAttempt, getAttempts } = require("../controllers/attemptController");

const router = express.Router();

router.post("/", requireAuth, submitAttempt);
router.get("/", requireAuth, getAttempts);

module.exports = router;
