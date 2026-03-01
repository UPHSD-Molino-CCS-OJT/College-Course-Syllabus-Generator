const mongoose = require("mongoose");
const { validatePayload } = require("../../utils");
const cloJoiSchema = require("./joiSchema");

const cloSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true,
      min: 1,
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
    // References to ProgramLearningOutcome documents (checked columns PLO 1-6)
    programLearningOutcomes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProgramLearningOutcome",
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

cloSchema.pre("save", function (next) {
  validatePayload(this.toObject(), cloJoiSchema.create);
  next();
});

cloSchema.pre("findOneAndUpdate", function (next) {
  validatePayload(this.getUpdate(), cloJoiSchema.update);
  next();
});

module.exports = mongoose.model("CourseLearningOutcome", cloSchema);
