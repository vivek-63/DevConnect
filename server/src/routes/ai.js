// server/src/routes/ai.js
const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai");
const { isAuthmiddleware, optionalAuthMiddleware } = require("../middleware/auth");
const wrapAsync = require("../utils/wrapAsync");
const { aiLimiter } = require("../middleware/RateLimit");

router.get("/status", optionalAuthMiddleware, wrapAsync(aiController.getStatus));
router.post("/profile-review", isAuthmiddleware, aiLimiter, wrapAsync(aiController.reviewProfile));
router.post("/resume-analyzer", isAuthmiddleware, aiLimiter, wrapAsync(aiController.analyzeResume));
router.post("/generate-post", isAuthmiddleware, aiLimiter, wrapAsync(aiController.generatePost));
router.post("/improve-post", isAuthmiddleware, aiLimiter, wrapAsync(aiController.improvePost));
router.post("/code-assistant", isAuthmiddleware, aiLimiter, wrapAsync(aiController.codeAssistant));
router.post("/learning-roadmap", isAuthmiddleware, aiLimiter, wrapAsync(aiController.learningRoadmap));
router.post("/project-description", isAuthmiddleware, aiLimiter, wrapAsync(aiController.generateProjectDescription));

module.exports = router;
