const router = require("express").Router();

const { protect } = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const {
  getFeed,
  getMyMission,
  submitStage,
  getHistory,
} = require("../controllers/stageController");

// Admin dashboard
router.get("/", protect, admin, getFeed);

// Volunteer mission
router.get("/mine", protect, getMyMission);

// Volunteer history
router.get("/history", protect, getHistory);

// Submit stage
router.post("/", protect, submitStage);

// Admin feed alias
router.get("/feed", protect, admin, getFeed);

module.exports = router;
