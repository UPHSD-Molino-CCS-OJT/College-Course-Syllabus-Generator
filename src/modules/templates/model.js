const mongoose = require("mongoose");
const { validatePayload } = require("../../utils");
const templateJoiSchema = require("./joiSchema");

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    pageSize: {
      type: String,
      required: true,
      enum: ["legal", "longBond", "letter", "a4"],
      default: "longBond",
    },
    orientation: {
      type: String,
      required: true,
      enum: ["landscape", "portrait"],
      default: "landscape",
    },
    canvasDocument: {
      header: {
        height: {
          type: Number,
          default: 120,
        },
        elements: {
          type: Array,
          default: [],
        },
      },
      footer: {
        height: {
          type: Number,
          default: 120,
        },
        elements: {
          type: Array,
          default: [],
        },
      },
      content: {
        elements: {
          type: Array,
          default: [],
        },
      },
      styles: {
        defaultFont: {
          type: String,
          default: "Arial",
        },
        defaultSize: {
          type: Number,
          default: 14,
        },
        headerBg: {
          type: String,
          default: "#f8f9fa",
        },
        footerBg: {
          type: String,
          default: "#f8f9fa",
        },
      },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ["academic", "business", "formal", "creative", "custom"],
      default: "custom",
    },
    createdBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Validation middleware
templateSchema.pre("save", function (next) {
  try {
    const schema = this.isNew ? templateJoiSchema.create : templateJoiSchema.update;
    validatePayload(this.toObject(), schema);
    next();
  } catch (error) {
    console.error("Validation error:", error);
    next();
  }
});

templateSchema.pre("findOneAndUpdate", function (next) {
  try {
    const update = this.getUpdate();
    const updateData = update.$set || update;
    validatePayload(updateData, templateJoiSchema.update);
    next();
  } catch (error) {
    console.error("Validation error:", error);
    next();
  }
});

const Template = mongoose.model("Template", templateSchema);

module.exports = Template;
