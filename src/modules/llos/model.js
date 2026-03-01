const mongoose = require("mongoose");
const { validatePayload } = require("../../utils");
const lloJoiSchema = require("./joiSchema");

const lloSchema = new mongoose.Schema(
  {
    // The outcome statement text (without domain suffix)
    text: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true,
    },
    // Domain: A = Affective, S = Skills/Psychomotor, K = Knowledge
    domain: {
      type: String,
      required: true,
      enum: ["A", "S", "K"],
    },
    // Exam period this LLO belongs to
    period: {
      type: String,
      required: true,
      enum: ["PRELIM", "MIDTERM", "FINAL"],
    },
    // Week label for grouping within a period (e.g. "FIRST WEEK", "SECOND WEEK – THIRD WEEK")
    weekLabel: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true,
    },
    // Ordering fields — controls the sort order in the matrix
    periodOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
    weekOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
    order: {
      type: Number,
      default: 1,
      min: 1,
    },
    // CLO references — which Course Learning Outcomes this LLO maps to
    courseLearningOutcomes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseLearningOutcome",
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

lloSchema.pre("save", function (next) {
  validatePayload(this.toObject(), lloJoiSchema.create);
  next();
});

lloSchema.pre("findOneAndUpdate", function (next) {
  validatePayload(this.getUpdate(), lloJoiSchema.update);
  next();
});

module.exports = mongoose.model("LessonLearningOutcome", lloSchema);
