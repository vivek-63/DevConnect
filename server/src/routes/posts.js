const express = require("express");
const { isAuthmiddleware, optionalAuthMiddleware } = require("../middleware/auth");
const router = express.Router();
const postController = require("../controllers/post");
const wrapAsync = require("../utils/wrapAsync");
const validate = require("../middleware/validate");
const { createPostSchema, updatePostSchema } = require("../validators/postValidator");

router.post("/posts", isAuthmiddleware, validate(createPostSchema), wrapAsync(postController.createPost));
router.get("/feed", optionalAuthMiddleware, wrapAsync(postController.getFeed));

// Delete post (support both /post/:id and /posts/:id)
router.delete("/post/:id", isAuthmiddleware, wrapAsync(postController.deletePost));
router.delete("/posts/:id", isAuthmiddleware, wrapAsync(postController.deletePost));

// Update post (support both /posts/:id and /post/:id)
router.put("/posts/:id", isAuthmiddleware, validate(updatePostSchema), wrapAsync(postController.updatePost));
router.put("/post/:id", isAuthmiddleware, validate(updatePostSchema), wrapAsync(postController.updatePost));

router.get("/posts/user", isAuthmiddleware, wrapAsync(postController.getUserPost));
router.get("/posts/saved", isAuthmiddleware, wrapAsync(postController.getSavedPosts));
router.get("/posts/:id", optionalAuthMiddleware, wrapAsync(postController.getPost));
router.get("/post/:id", optionalAuthMiddleware, wrapAsync(postController.getPost));

// Like & Unlike (support both singular and plural)
router.post("/post/:id/like", isAuthmiddleware, wrapAsync(postController.likePost));
router.post("/posts/:id/like", isAuthmiddleware, wrapAsync(postController.likePost));
router.delete("/post/:id/unlike", isAuthmiddleware, wrapAsync(postController.unlikePost));
router.delete("/posts/:id/unlike", isAuthmiddleware, wrapAsync(postController.unlikePost));

router.post("/posts/:id/save", isAuthmiddleware, wrapAsync(postController.savePost));
router.delete("/posts/:id/save", isAuthmiddleware, wrapAsync(postController.unsavePost));

module.exports = router;