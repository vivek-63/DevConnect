const Joi = require("joi");

const createProjectSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required(),

  description: Joi.string()
    .trim()
    .min(10)
    .max(2000)
    .required(),

  image: Joi.string()
    .uri()
    .allow("", null),

  githubUrl: Joi.string()
    .uri()
    .allow("", null),

  liveUrl: Joi.string()
    .uri()
    .allow("", null),

  techStack: Joi.array()
    .items(
      Joi.string()
        .trim()
        .min(1)
        .max(50)
    )
    .min(1)
    .max(20)
    .required(),
});

const updateProjectSchema =
  createProjectSchema.fork(
    [
      "title",
      "description",
      "image",
      "githubUrl",
      "liveUrl",
      "techStack",
    ],
    (field) => field.optional()
  );

module.exports = {
  createProjectSchema,
  updateProjectSchema,
};