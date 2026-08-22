const router = require("express").Router();
const { protect: auth } = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const c = require("../controllers/stageController");

// NEW: GET all stage updates (or feed)
router.get("/", auth, admin, c.getFeed);

router.get("/mine", auth, c.getMyMission);
router.post("/", auth, c.submitStage);
router.get("/feed", auth, admin, c.getFeed);
router.get("/history", auth, c.getHistory);

module.exports = router;
