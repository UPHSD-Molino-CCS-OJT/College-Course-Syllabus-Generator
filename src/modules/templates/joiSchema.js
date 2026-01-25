const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    name: Joi.string().max(200).required(),
    description: Joi.string().max(500).allow(""),
    pageSize: Joi.string().valid("legal", "longBond", "letter", "a4").required(),
    orientation: Joi.string().valid("landscape", "portrait").required(),
    canvasDocument: Joi.object({
      header: Joi.object({
        height: Joi.number().min(0).max(500),
        elements: Joi.array(),
      }),
      footer: Joi.object({
        height: Joi.number().min(0).max(500),
        elements: Joi.array(),
      }),
      // Support both old (content) and new (pages) structure
      content: Joi.object({
        elements: Joi.array(),
      }).optional(),
      pages: Joi.array().items(
        Joi.object({
          id: Joi.string(),
          elements: Joi.array(),
        })
      ).optional(),
      styles: Joi.object({
        defaultFont: Joi.string(),
        defaultSize: Joi.number(),
        headerBg: Joi.string(),
        footerBg: Joi.string(),
      }),
    }),
    isDefault: Joi.boolean(),
    category: Joi.string().valid("academic", "business", "formal", "creative", "custom"),
    createdBy: Joi.string().allow(null),
    createdAt: Joi.date(),
    updatedAt: Joi.date(),
  }),

  update: Joi.object().keys({
    name: Joi.string().max(200),
    description: Joi.string().max(500).allow(""),
    pageSize: Joi.string().valid("legal", "longBond", "letter", "a4"),
    orientation: Joi.string().valid("landscape", "portrait"),
    canvasDocument: Joi.object({
      header: Joi.object({
        height: Joi.number().min(0).max(500),
        elements: Joi.array(),
      }),
      footer: Joi.object({
        height: Joi.number().min(0).max(500),
        elements: Joi.array(),
      }),
      // Support both old (content) and new (pages) structure
      content: Joi.object({
        elements: Joi.array(),
      }).optional(),
      pages: Joi.array().items(
        Joi.object({
          id: Joi.string(),
          elements: Joi.array(),
        })
      ).optional(),
      styles: Joi.object({
        defaultFont: Joi.string(),
        defaultSize: Joi.number(),
        headerBg: Joi.string(),
        footerBg: Joi.string(),
      }),
    }),
    isDefault: Joi.boolean(),
    category: Joi.string().valid("academic", "business", "formal", "creative", "custom"),
    createdBy: Joi.string().allow(null),
    createdAt: Joi.date(),
    updatedAt: Joi.date(),
  }),
};
