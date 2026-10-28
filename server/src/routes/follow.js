const express = require("express");
const { isAuthmiddleware } = require("../middleware/auth");
const router = express.Router();
const followController = require("../controllers/follow");
const wrapAsync = require("../utils/wrapAsync");

router.post("/follow/:id", isAuthmiddleware, wrapAsync(followController.followUser));
router.delete("/follow/:id", isAuthmiddleware, wrapAsync(followController.unfollowUser));
router.get("/follow/status/:id", isAuthmiddleware, wrapAsync(followController.checkFollowStatus));
router.get("/users/:id/followers", wrapAsync(followController.getFollowers));
router.get("/users/:id/following", wrapAsync(followController.getFollowing));

module.exports = router;