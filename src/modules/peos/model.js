const mongoose = require("mongoose");
const { validatePayload } = require("../../utils");
const peoJoiSchema = require("./joiSchema");

const peoSchema = new mongoose.Schema(
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
    // References to GraduateAttribute documents (checked columns GA1-GA11)
    graduateAttributes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GraduateAttribute",
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

peoSchema.pre("save", function (next) {
  validatePayload(this.toObject(), peoJoiSchema.create);
  next();
});

peoSchema.pre("findOneAndUpdate", function (next) {
  validatePayload(this.getUpdate(), peoJoiSchema.update);
  next();
});

module.exports = mongoose.model("ProgramEducationalObjective", peoSchema);
