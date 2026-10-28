const Joi = require("joi");

const createMessageSchema = Joi.object({
  conversationId: Joi.number()
    .integer()
    .positive()
    .required(),

  content: Joi.string()
    .trim()
    .min(1)
    .max(5000)
    .required(),
});

module.exports = {
  createMessageSchema,
};