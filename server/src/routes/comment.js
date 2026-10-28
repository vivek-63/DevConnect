const express = require("express");
const { isAuthmiddleware, optionalAuthMiddleware } = require("../middleware/auth");
const router = express.Router();
const commentController = require("../controllers/comment");
const wrapAsync = require("../utils/wrapAsync");
const validate = require("../middleware/validate");
const { createCommentSchema } = require("../validators/commentValidator");

router.post("/posts/:id/comments", isAuthmiddleware, validate(createCommentSchema), wrapAsync(commentController.createComment));

router.get("/posts/:id/comments", optionalAuthMiddleware, wrapAsync(commentController.getComments));

router.delete("/comments/:id", isAuthmiddleware, wrapAsync(commentController.deleteComment));
router.delete("/comment/:id", isAuthmiddleware, wrapAsync(commentController.deleteComment));

module.exports = router;