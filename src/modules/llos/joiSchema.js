const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    text: Joi.string().max(1000).required(),
    domain: Joi.string().valid("A", "S", "K").required(),
    period: Joi.string().valid("PRELIM", "MIDTERM", "FINAL").required(),
    weekLabel: Joi.string().max(200).required(),
    periodOrder: Joi.number().integer().min(0).default(0),
    weekOrder: Joi.number().integer().min(0).default(0),
    order: Joi.number().integer().min(1).default(1),
    // Array of CLO ObjectId references
    courseLearningOutcomes: Joi.array().items(Joi.string()).default([]),
    isActive: Joi.boolean(),
  }),

  update: Joi.object().keys({
    text: Joi.string().max(1000),
    domain: Joi.string().valid("A", "S", "K"),
    period: Joi.string().valid("PRELIM", "MIDTERM", "FINAL"),
    weekLabel: Joi.string().max(200),
    periodOrder: Joi.number().integer().min(0),
    weekOrder: Joi.number().integer().min(0),
    order: Joi.number().integer().min(1),
    courseLearningOutcomes: Joi.array().items(Joi.string()),
    isActive: Joi.boolean(),
  }),
};
