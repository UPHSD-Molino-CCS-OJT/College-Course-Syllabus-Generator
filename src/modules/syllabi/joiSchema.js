const Joi = require("joi");

const weekSchema = Joi.object({
  weekNumber: Joi.number().required(),
  topic: Joi.string().max(500).required(),
  activities: Joi.string().max(1000).allow(""),
  assignments: Joi.string().max(500).allow(""),
});

const gradingComponentSchema = Joi.object({
  component: Joi.string().max(200).required(),
  percentage: Joi.number().min(0).max(100).required(),
  description: Joi.string().max(500).allow(""),
});

const learningOutcomeSchema = Joi.object({
  outcome: Joi.string().max(500).required(),
});

module.exports = {
  create: Joi.object().keys({
    courseCode: Joi.string().max(50).required(),
    courseTitle: Joi.string().max(200).required(),
    department: Joi.string().max(200).required(),
    credits: Joi.number().min(1).max(10).required(),
    semester: Joi.string().valid("1st Semester", "2nd Semester", "Summer").required(),
    year: Joi.number().min(2000).max(2100).required(),
    
    instructorName: Joi.string().max(200).required(),
    instructorEmail: Joi.string().email().max(200).required(),
    officeHours: Joi.string().max(500).allow(""),
    officeLocation: Joi.string().max(200).allow(""),
    
    description: Joi.string().max(2000).required(),
    prerequisites: Joi.string().max(500).allow(""),
    learningOutcomes: Joi.array().items(learningOutcomeSchema),
    
    textbooks: Joi.string().max(1000).allow(""),
    additionalMaterials: Joi.string().max(1000).allow(""),
    
    gradingComponents: Joi.array().items(gradingComponentSchema),
    gradingScale: Joi.string().max(500).allow(""),
    
    weeklySchedule: Joi.array().items(weekSchema),
    
    attendancePolicy: Joi.string().max(1000).allow(""),
    lateSubmissionPolicy: Joi.string().max(1000).allow(""),
    academicIntegrity: Joi.string().max(1000).allow(""),
    disabilities: Joi.string().max(1000).allow(""),
    
    status: Joi.string().valid("draft", "published", "archived"),
    template: Joi.string().allow(null),
    createdBy: Joi.string().allow(null),
    createdAt: Joi.date(),
    updatedAt: Joi.date(),
  }),

  update: Joi.object().keys({
    courseCode: Joi.string().max(50),
    courseTitle: Joi.string().max(200),
    department: Joi.string().max(200),
    credits: Joi.number().min(1).max(10),
    semester: Joi.string().valid("1st Semester", "2nd Semester", "Summer"),
    year: Joi.number().min(2000).max(2100),
    
    instructorName: Joi.string().max(200),
    instructorEmail: Joi.string().email().max(200),
    officeHours: Joi.string().max(500).allow(""),
    officeLocation: Joi.string().max(200).allow(""),
    
    description: Joi.string().max(2000),
    prerequisites: Joi.string().max(500).allow(""),
    learningOutcomes: Joi.array().items(learningOutcomeSchema),
    
    textbooks: Joi.string().max(1000).allow(""),
    additionalMaterials: Joi.string().max(1000).allow(""),
    
    gradingComponents: Joi.array().items(gradingComponentSchema),
    gradingScale: Joi.string().max(500).allow(""),
    
    weeklySchedule: Joi.array().items(weekSchema),
    
    attendancePolicy: Joi.string().max(1000).allow(""),
    lateSubmissionPolicy: Joi.string().max(1000).allow(""),
    academicIntegrity: Joi.string().max(1000).allow(""),
    disabilities: Joi.string().max(1000).allow(""),
    
    status: Joi.string().valid("draft", "published", "archived"),
    template: Joi.string().allow(null),
    createdBy: Joi.string().allow(null),
    createdAt: Joi.date(),
    updatedAt: Joi.date(),
  }),
};
