const Joi = require("joi");

const createPostSchema = Joi.object({
  content: Joi.string()
    .trim()
    .min(1)
    .max(5000)
    .required(),

  image: Joi.string()
    .uri()
    .allow("", null),
});

const updatePostSchema = Joi.object({
  content: Joi.string()
    .trim()
    .min(1)
    .max(5000),

  image: Joi.string()
    .uri()
    .allow("", null),
}).min(1);

module.exports = {
  createPostSchema,
  updatePostSchema,
};