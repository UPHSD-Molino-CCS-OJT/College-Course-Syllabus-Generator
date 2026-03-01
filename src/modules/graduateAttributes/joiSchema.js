const Joi = require("joi");

const CATEGORIES = ["CHARACTER", "COMPETENCE", "COMMITMENT TO SERVICE"];

module.exports = {
  create: Joi.object().keys({
    number: Joi.number().integer().min(1).required(),
    category: Joi.string().valid(...CATEGORIES).required(),
    title: Joi.string().max(300).required(),
    description: Joi.string().max(1000).allow(""),
    missionKeywords: Joi.array().items(Joi.string()).default([]),
    isActive: Joi.boolean(),
  }),

  update: Joi.object().keys({
    number: Joi.number().integer().min(1),
    category: Joi.string().valid(...CATEGORIES),
    title: Joi.string().max(300),
    description: Joi.string().max(1000).allow(""),
    missionKeywords: Joi.array().items(Joi.string()),
    isActive: Joi.boolean(),
  }),
};
