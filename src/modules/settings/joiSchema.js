const Joi = require("joi");

const brandingSettingsJoiSchema = {
  create: Joi.object({
    institutionName: Joi.string().max(200).required(),
    institutionLogo: Joi.string().uri().allow("").optional(),
    headerText: Joi.string().max(500).allow("").optional(),
    footerText: Joi.string().max(500).allow("").optional(),
    primaryColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default("#1E40AF"),
    secondaryColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default("#3B82F6"),
    fontSize: Joi.string().valid("small", "medium", "large").default("medium"),
    fontFamily: Joi.string().max(100).default("Arial, sans-serif"),
  }),

  update: Joi.object({
    institutionName: Joi.string().max(200).optional(),
    institutionLogo: Joi.string().uri().allow("").optional(),
    headerText: Joi.string().max(500).allow("").optional(),
    footerText: Joi.string().max(500).allow("").optional(),
    primaryColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
    secondaryColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
    fontSize: Joi.string().valid("small", "medium", "large").optional(),
    fontFamily: Joi.string().max(100).optional(),
  }),
};

module.exports = brandingSettingsJoiSchema;
