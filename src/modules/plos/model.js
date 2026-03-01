const mongoose = require("mongoose");
const { validatePayload } = require("../../utils");
const ploJoiSchema = require("./joiSchema");

const ploSchema = new mongoose.Schema(
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
    // References to ProgramEducationalObjective documents (checked columns PEO 1-4)
    programEducationalObjectives: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProgramEducationalObjective",
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

ploSchema.pre("save", function (next) {
  validatePayload(this.toObject(), ploJoiSchema.create);
  next();
});

ploSchema.pre("findOneAndUpdate", function (next) {
  validatePayload(this.getUpdate(), ploJoiSchema.update);
  next();
});

module.exports = mongoose.model("ProgramLearningOutcome", ploSchema);
