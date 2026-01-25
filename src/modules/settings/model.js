const mongoose = require("mongoose");
const { validatePayload } = require("../../utils");
const brandingSettingsJoiSchema = require("./joiSchema");

const brandingSettingsSchema = new mongoose.Schema(
  {
    institutionName: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true,
    },
    institutionLogo: {
      type: String,
      default: "",
    },
    // Legacy fields (kept for backward compatibility)
    headerText: {
      type: String,
      maxlength: 500,
      default: "",
    },
    footerText: {
      type: String,
      maxlength: 500,
      default: "",
    },
    // New flexible header/footer content structure
    headerLayout: {
      type: String,
      enum: ['vertical', 'horizontal'],
      default: 'vertical',
    },
    headerContent: {
      type: [{
        type: {
          type: String,
          enum: ['text', 'image', 'group'],
          required: true,
        },
        content: {
          type: String, // For text: actual text; For image: base64 string; For group: not used
        },
        alignment: {
          type: String,
          enum: ['left', 'center', 'right'],
          default: 'center',
        },
        styles: {
          fontWeight: { type: String, default: 'normal' },
          fontSize: { type: String, default: 'medium' },
          color: { type: String, default: '#000000' },
          width: { type: Number }, // For images
          height: { type: Number }, // For images
        },
        children: [{
          type: {
            type: String,
            enum: ['text', 'image'],
          },
          content: {
            type: String,
          },
          styles: {
            fontWeight: { type: String, default: 'normal' },
            fontSize: { type: String, default: 'medium' },
            color: { type: String, default: '#000000' },
            width: { type: Number },
            height: { type: Number },
          },
        }], // For group type: child elements
        order: {
          type: Number,
          default: 0,
        },
      }],
      default: [],
    },
    footerLayout: {
      type: String,
      enum: ['vertical', 'horizontal'],
      default: 'vertical',
    },
    footerContent: {
      type: [{
        type: {
          type: String,
          enum: ['text', 'image', 'group'],
          required: true,
        },
        content: {
          type: String,
        },
        alignment: {
          type: String,
          enum: ['left', 'center', 'right'],
          default: 'center',
        },
        styles: {
          fontWeight: { type: String, default: 'normal' },
          fontSize: { type: String, default: 'medium' },
          color: { type: String, default: '#000000' },
          width: { type: Number },
          height: { type: Number },
        },
        children: [{
          type: {
            type: String,
            enum: ['text', 'image'],
          },
          content: {
            type: String,
          },
          styles: {
            fontWeight: { type: String, default: 'normal' },
            fontSize: { type: String, default: 'medium' },
            color: { type: String, default: '#000000' },
            width: { type: Number },
            height: { type: Number },
          },
        }],
        order: {
          type: Number,
          default: 0,
        },
      }],
      default: [],
    },
    primaryColor: {
      type: String,
      default: "#1E40AF",
      match: /^#[0-9A-Fa-f]{6}$/,
    },
    secondaryColor: {
      type: String,
      default: "#3B82F6",
      match: /^#[0-9A-Fa-f]{6}$/,
    },
    fontSize: {
      type: String,
      enum: ["small", "medium", "large"],
      default: "medium",
    },
    fontFamily: {
      type: String,
      default: "Arial, sans-serif",
      maxlength: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware for validation
brandingSettingsSchema.pre("save", function (next) {
  const schema = this.isNew ? brandingSettingsJoiSchema.create : brandingSettingsJoiSchema.update;
  validatePayload(this.toObject(), schema);
  next();
});

// Pre-update middleware for validation
brandingSettingsSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  const updateData = update.$set || update;
  validatePayload(updateData, brandingSettingsJoiSchema.update);
  next();
});

const BrandingSettings = mongoose.model("BrandingSettings", brandingSettingsSchema);

module.exports = BrandingSettings;
