const Joi = require("joi");

// Content block schema for header/footer
const contentBlockSchema = Joi.object({
  type: Joi.string().valid("text", "image").required(),
  content: Joi.string().required(),
  alignment: Joi.string().valid("left", "center", "right").default("center"),
  styles: Joi.object({
    fontWeight: Joi.string().default("normal"),
    fontSize: Joi.string().default("medium"),
    color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default("#000000"),
    width: Joi.number().optional(),
    height: Joi.number().optional(),
  }).optional(),
  order: Joi.number().default(0),
});

const brandingSettingsJoiSchema = {
  create: Joi.object({
    institutionName: Joi.string().max(200).required(),
    institutionLogo: Joi.string().uri().allow("").optional(),
    headerText: Joi.string().max(500).allow("").optional(),
    footerText: Joi.string().max(500).allow("").optional(),
    headerLayout: Joi.string().valid("vertical", "horizontal").default("vertical"),
    headerContent: Joi.array().items(contentBlockSchema).optional(),
    footerLayout: Joi.string().valid("vertical", "horizontal").default("vertical"),
    footerContent: Joi.array().items(contentBlockSchema).optional(),
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
    headerLayout: Joi.string().valid("vertical", "horizontal").optional(),
    headerContent: Joi.array().items(contentBlockSchema).optional(),
    footerLayout: Joi.string().valid("vertical", "horizontal").optional(),
    footerContent: Joi.array().items(contentBlockSchema).optional(),
    primaryColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
    secondaryColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
    fontSize: Joi.string().valid("small", "medium", "large").optional(),
    fontFamily: Joi.string().max(100).optional(),
  }),
};

module.exports = brandingSettingsJoiSchema;
