const mongoose = require("mongoose");
const { validatePayload } = require("../../utils");
const missionKeywordJoiSchema = require("./joiSchema");

const missionKeywordSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      maxlength: 10,
      trim: true,
      uppercase: true,
      unique: true,
    },
    label: {
      type: String,
      required: true,
      maxlength: 300,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

missionKeywordSchema.pre("save", function (next) {
  validatePayload(this.toObject(), missionKeywordJoiSchema.create);
  next();
});

missionKeywordSchema.pre("findOneAndUpdate", function (next) {
  validatePayload(this.getUpdate(), missionKeywordJoiSchema.update);
  next();
});

module.exports = mongoose.model("MissionKeyword", missionKeywordSchema);
