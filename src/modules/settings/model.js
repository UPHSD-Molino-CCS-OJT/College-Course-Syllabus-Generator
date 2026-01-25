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
