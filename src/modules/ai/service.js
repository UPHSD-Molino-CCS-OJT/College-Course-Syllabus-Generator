const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemma-3-27b-it";

const buildPrompt = ({ courseTitle, courseCode, department, credits }) => {
  const courseInfo = [
    `Title: ${courseTitle}`,
    courseCode ? `Code: ${courseCode}` : null,
    department ? `Department: ${department}` : null,
    credits ? `Credits: ${credits}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `You are an academic curriculum designer. Generate comprehensive, professional syllabus content for a college course. Return ONLY a valid JSON object with no extra text, no markdown code fences, no explanation.

Course Information:
${courseInfo}

Generate a JSON object with exactly these fields:
{
  "description": "2-3 paragraph course description covering scope, purpose, and relevance",
  "prerequisites": "Prerequisite courses or assumed knowledge (or 'None' if not applicable)",
  "learningOutcomes": [
    { "outcome": "Students will be able to [action verb] [specific skill/knowledge]" }
  ],
  "textbooks": "Required textbook(s) — Author, Title, Edition, ISBN",
  "additionalMaterials": "Supplementary readings, online resources, or tools",
  "gradingComponents": [
    { "component": "Component name", "percentage": 0, "description": "Brief description" }
  ],
  "weeklySchedule": [
    { "weekNumber": 1, "topic": "Topic title", "activities": "In-class activities", "assignments": "Homework or reading" }
  ],
  "attendancePolicy": "Attendance requirements and consequences for absences",
  "lateSubmissionPolicy": "Policy on late or missed assignments",
  "academicIntegrity": "Academic honesty expectations and consequences for violations",
  "disabilities": "Statement on accessibility accommodations for students with disabilities"
}

Rules:
- learningOutcomes: provide exactly 6 outcomes using Bloom's taxonomy action verbs
- gradingComponents: include 4-6 components whose percentages sum to exactly 100
- weeklySchedule: provide exactly 16 weeks covering the full semester progression
- All content must be professional, specific to the course subject, and suitable for a college-level course
- Return ONLY the raw JSON object`;
};

const generateSyllabusContent = async ({ courseTitle, courseCode, department, credits }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  });

  const prompt = buildPrompt({ courseTitle, courseCode, department, credits });

  let result;
  try {
    result = await model.generateContent(prompt);
  } catch (err) {
    throw new Error(`Gemini API error: ${err.message}`);
  }

  const text = result.response.text();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    // Try to extract JSON if the model included surrounding text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Failed to parse JSON from Gemini response");
    }
  }

  return parsed;
};

module.exports = { generateSyllabusContent };
