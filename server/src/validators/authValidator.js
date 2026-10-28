const Joi = require("joi");

const registerSchema = Joi.object({
  username: Joi.string()
    .trim()
    .min(3)
    .max(30)
    .required(),

  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required(),

  password: Joi.string()
    .min(8)
    .max(100)
    .required(),
});

const loginSchema = Joi.object({
  username: Joi.string()
    .trim()
    .min(3)
    .max(255)
    .required(),

  password: Joi.string()
    .required(),
});

module.exports = {
  registerSchema,
  loginSchema,
};