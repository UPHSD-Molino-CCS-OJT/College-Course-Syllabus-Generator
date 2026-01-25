const mongoose = require("mongoose");
const { validatePayload } = require("../../utils");
const syllabusJoiSchema = require("./joiSchema");

const weekSchema = new mongoose.Schema({
  weekNumber: {
    type: Number,
    required: true,
  },
  topic: {
    type: String,
    required: true,
    maxlength: 500,
  },
  activities: {
    type: String,
    maxlength: 1000,
  },
  assignments: {
    type: String,
    maxlength: 500,
  },
}, { _id: false });

const gradingComponentSchema = new mongoose.Schema({
  component: {
    type: String,
    required: true,
    maxlength: 200,
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  description: {
    type: String,
    maxlength: 500,
  },
}, { _id: false });

const learningOutcomeSchema = new mongoose.Schema({
  outcome: {
    type: String,
    required: true,
    maxlength: 500,
  },
}, { _id: false });

const syllabusSchema = new mongoose.Schema(
  {
    // Course Information
    courseCode: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true,
    },
    courseTitle: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      maxlength: 200,
    },
    credits: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    semester: {
      type: String,
      required: true,
      enum: ["First Semester", "Second Semester", "Summer"],
    },
    academicYear: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^\d{4}-\d{4}$/.test(v);
        },
        message: props => `${props.value} is not a valid academic year format (YYYY-YYYY)!`
      }
    },

    // Instructor Information
    instructorName: {
      type: String,
      required: true,
      maxlength: 200,
    },
    instructorEmail: {
      type: String,
      required: true,
      lowercase: true,
      maxlength: 200,
    },
    officeHours: {
      type: String,
      maxlength: 500,
    },
    officeLocation: {
      type: String,
      maxlength: 200,
    },

    // Course Details
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    prerequisites: {
      type: String,
      maxlength: 500,
    },
    learningOutcomes: [learningOutcomeSchema],

    // Course Materials
    textbooks: {
      type: String,
      maxlength: 1000,
    },
    additionalMaterials: {
      type: String,
      maxlength: 1000,
    },

    // Grading
    gradingComponents: [gradingComponentSchema],
    gradingScale: {
      type: String,
      maxlength: 500,
      default: "A: 90-100, B: 80-89, C: 70-79, D: 60-69, F: Below 60",
    },

    // Schedule
    weeklySchedule: [weekSchema],

    // Policies
    attendancePolicy: {
      type: String,
      maxlength: 1000,
    },
    lateSubmissionPolicy: {
      type: String,
      maxlength: 1000,
    },
    academicIntegrity: {
      type: String,
      maxlength: 1000,
    },
    disabilities: {
      type: String,
      maxlength: 1000,
    },

    // Approval Information
    dateRevised: {
      type: String,
      match: /^\d{4}-(0[1-9]|1[0-2])$/,
    },
    dateOfEffectivity: {
      type: String,
      match: /^\d{4}-(0[1-9]|1[0-2])$/,
    },
    reviewed: {
      type: String,
      maxlength: 200,
    },
    recommendingApproval: {
      type: String,
      maxlength: 200,
    },
    approved: {
      type: String,
      maxlength: 200,
    },

    // Status
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    // Template Reference
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template",
    },

    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware for validation
syllabusSchema.pre("save", function (next) {
  const schema = this.isNew ? syllabusJoiSchema.create : syllabusJoiSchema.update;
  validatePayload(this.toObject(), schema);
  next();
});

// Pre-update middleware for validation
syllabusSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  const updateData = update.$set || update;
  validatePayload(updateData, syllabusJoiSchema.update);
  next();
});

// Instance method to generate full course name
syllabusSchema.methods.getFullCourseName = function () {
  return `${this.courseCode} - ${this.courseTitle}`;
};

// Static method to find by semester and academic year
syllabusSchema.statics.findBySemester = function (semester, academicYear) {
  return this.find({ semester, academicYear, status: "published" })
    .sort({ courseCode: 1 })
    .exec();
};

const Syllabus = mongoose.model("Syllabus", syllabusSchema);

module.exports = Syllabus;
