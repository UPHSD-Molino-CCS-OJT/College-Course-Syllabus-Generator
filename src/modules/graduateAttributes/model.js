const mongoose = require("mongoose");
const { validatePayload } = require("../../utils");
const graduateAttributeJoiSchema = require("./joiSchema");

const CATEGORIES = ["CHARACTER", "COMPETENCE", "COMMITMENT TO SERVICE"];

const graduateAttributeSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true,
      min: 1,
    },
    category: {
      type: String,
      required: true,
      enum: CATEGORIES,
    },
    title: {
      type: String,
      required: true,
      maxlength: 300,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
    // References to MissionKeyword documents (checked columns A-F)
    missionKeywords: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MissionKeyword",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

graduateAttributeSchema.pre("save", function (next) {
  validatePayload(this.toObject(), graduateAttributeJoiSchema.create);
  next();
});

graduateAttributeSchema.pre("findOneAndUpdate", function (next) {
  validatePayload(this.getUpdate(), graduateAttributeJoiSchema.update);
  next();
});

module.exports = mongoose.model("GraduateAttribute", graduateAttributeSchema);
