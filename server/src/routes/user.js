const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const { isAuthmiddleware, optionalAuthMiddleware } = require("../middleware/auth");
const { authLimiter } = require("../middleware/RateLimit");
const validate = require("../middleware/validate");
const wrapAsync = require("../utils/wrapAsync");
const { registerSchema, loginSchema } = require("../validators/authValidator");

router.post("/register", authLimiter, validate(registerSchema), wrapAsync(userController.registerUser));
router.post("/login", authLimiter, validate(loginSchema), wrapAsync(userController.loginUser));
router.get("/login", (req, res) => {
  res.status(200).json({ message: "Use POST /login to authenticate" });
});
router.post("/logout", wrapAsync(userController.logoutUser));
router.get("/getMe", isAuthmiddleware, wrapAsync(userController.getMe));
router.get("/me", isAuthmiddleware, wrapAsync(userController.getMe));
router.get("/auth/me", isAuthmiddleware, wrapAsync(userController.getMe));

router.get("/profile", isAuthmiddleware, wrapAsync(userController.getProfile));
router.get("/profile/:username", optionalAuthMiddleware, wrapAsync(userController.getPublicProfile));
router.put("/profile/edit", isAuthmiddleware, wrapAsync(userController.updateProfile));
router.get("/users/suggested", optionalAuthMiddleware, wrapAsync(userController.getSuggestedUsers));

module.exports = router;
