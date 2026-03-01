const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    number: Joi.number().integer().min(1).required(),
    title: Joi.string().max(300).required(),
    description: Joi.string().max(1000).allow(""),
    // Array of GraduateAttribute ObjectId references (checked columns GA1-GA11)
    graduateAttributes: Joi.array().items(Joi.string()).default([]),
    isActive: Joi.boolean(),
  }),

  update: Joi.object().keys({
    number: Joi.number().integer().min(1),
    title: Joi.string().max(300),
    description: Joi.string().max(1000).allow(""),
    graduateAttributes: Joi.array().items(Joi.string()),
    isActive: Joi.boolean(),
  }),
};
