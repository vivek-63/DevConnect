const express = require("express");

const router = express.Router();

const searchController = require("../controllers/search");
const { searchLimiter } = require("../middleware/RateLimit");
const validate = require("../middleware/validate");
const { searchSchema } = require("../validators/searchValidator");
const { optionalAuthMiddleware } = require("../middleware/auth");

router.get(
  "/search",
  searchLimiter,
  validate(searchSchema, "query"),
  searchController.globalSearch
);

router.get(
  "/discover/users",
  optionalAuthMiddleware,
  searchLimiter,
  searchController.discoverDevelopers
);

module.exports = router;