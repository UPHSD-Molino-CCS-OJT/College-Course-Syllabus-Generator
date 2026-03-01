const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    code: Joi.string().max(10).uppercase().required(),
    label: Joi.string().max(300).required(),
    isActive: Joi.boolean(),
  }),

  update: Joi.object().keys({
    code: Joi.string().max(10).uppercase(),
    label: Joi.string().max(300),
    isActive: Joi.boolean(),
  }),
};
