const Joi = require("joi");

const searchSchema = Joi.object({
  q: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required(),

  type: Joi.string()
    .valid(
      "all",
      "people",
      "posts",
      "projects"
    )
    .default("all"),

  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10),
});

module.exports = {
  searchSchema,
};