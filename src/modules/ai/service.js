const { GoogleGenAI } = require("@google/genai");
const PLO = require("../plos/model");
const CLO = require("../clos/model");
const LLO = require("../llos/model");

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemma-3-27b-it";

const buildSyllabusPrompt = ({ courseTitle, courseCode, department, credits }) => {
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

const buildOutcomesPrompt = ({ courseTitle, courseCode, department, credits, plos }) => {
  const courseInfo = [
    `Title: ${courseTitle}`,
    courseCode ? `Code: ${courseCode}` : null,
    department ? `Department: ${department}` : null,
    credits ? `Credits: ${credits}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const ploContext = plos.length > 0
    ? plos.map((p) => `  PLO ${p.number}: ${p.title}${p.description ? ` — ${p.description}` : ""}`).join("\n")
    : "  (No PLOs defined yet)";

  return `You are an academic curriculum designer. Generate Course Learning Outcomes (CLOs) and Lesson Learning Outcomes (LLOs) for a college course, mapped to the provided Program Learning Outcomes (PLOs). Return ONLY a valid JSON object with no extra text, no markdown code fences, no explanation.

Course Information:
${courseInfo}

Existing Program Learning Outcomes (PLOs):
${ploContext}

Generate a JSON object with exactly these two fields:

{
  "clos": [
    {
      "number": 1,
      "title": "Short CLO title (max 10 words)",
      "description": "Full CLO statement starting with an action verb (Bloom's taxonomy)",
      "ploNumbers": [1, 2]
    }
  ],
  "llos": [
    {
      "text": "LLO outcome statement",
      "domain": "A",
      "period": "PRELIM",
      "weekLabel": "FIRST WEEK",
      "periodOrder": 1,
      "weekOrder": 1,
      "order": 1,
      "cloNumbers": [1]
    }
  ]
}

Rules for CLOs:
- Generate exactly 6 CLOs numbered 1-6
- Each CLO must map to at least one PLO using its number from the list above (use empty array [] only if no PLOs exist)
- CLO descriptions must use measurable Bloom's taxonomy verbs (define, explain, analyze, evaluate, design, demonstrate, etc.)

Rules for LLOs:
CRITICAL: For every week or week-range, you MUST generate EXACTLY 3 LLOs in this fixed order:
  1. domain "A" (Attitude/Affective), order=1
  2. domain "S" (Skills/Psychomotor), order=2
  3. domain "K" (Knowledge/Cognitive), order=3

Text format per domain — follow these templates precisely:
  A: "Learners will develop an appreciation for [topic], valuing [why it matters in the course context]."
  S: "Learners will be able to apply [skill] by [specific observable action relevant to the topic]."
  K: "Learners will be able to [explain/describe/analyze/identify] [concept], [and describe/compare/demonstrate a related concept]."

Week grouping structure — 3 periods, group weeks as follows:
  PRELIM   (periodOrder=1): FIRST WEEK, SECOND WEEK, THIRD WEEK, FOURTH – FIFTH WEEK  → 4 groups × 3 LLOs = 12 LLOs
  MIDTERM  (periodOrder=2): SIXTH WEEK, SEVENTH WEEK, EIGHTH WEEK, NINTH – TENTH WEEK → 4 groups × 3 LLOs = 12 LLOs
  FINAL    (periodOrder=3): ELEVENTH WEEK, TWELFTH WEEK, THIRTEENTH WEEK, FOURTEENTH WEEK, FIFTEENTH – SIXTEENTH WEEK → 5 groups × 3 LLOs = 15 LLOs

Total: exactly 39 LLOs.

weekOrder is the group's sequential position within its period (1, 2, 3, … etc.)
periodOrder values: PRELIM=1, MIDTERM=2, FINAL=3
Each LLO must map to at least one CLO using its cloNumbers
All LLO text must be specific to the course subject matter — no generic statements.
Return ONLY the raw JSON object`;
};

const callGemini = async (ai, prompt) => {
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  });
  const text = response.text;
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error("Failed to parse JSON from Gemini response");
  }
};

const generateSyllabusContent = async ({ courseTitle, courseCode, department, credits }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Fetch existing PLOs from DB to use as mapping context
  const existingPLOs = await PLO.find({ isActive: true })
    .sort({ number: 1 })
    .select("number title description")
    .lean();

  // Run two AI calls in parallel: syllabus fields + outcomes generation
  const [syllabusFields, outcomesData] = await Promise.all([
    callGemini(ai, buildSyllabusPrompt({ courseTitle, courseCode, department, credits })),
    callGemini(ai, buildOutcomesPrompt({ courseTitle, courseCode, department, credits, plos: existingPLOs })),
  ]);

  // Build a PLO number → ObjectId map
  const ploIdByNumber = {};
  for (const plo of existingPLOs) {
    ploIdByNumber[plo.number] = plo._id;
  }

  // Determine the next CLO number to avoid collisions
  const lastCLO = await CLO.findOne().sort({ number: -1 }).select("number").lean();
  const cloNumberOffset = lastCLO ? lastCLO.number : 0;

  // Save generated CLOs and build a cloNumber (within this generation) → ObjectId map
  const generatedCLOs = outcomesData.clos || [];
  const cloIdByGeneratedNumber = {};
  const createdCLOIds = [];

  for (const cloData of generatedCLOs) {
    const ploIds = (cloData.ploNumbers || [])
      .map((n) => ploIdByNumber[n])
      .filter(Boolean);

    const savedCLO = await CLO.create({
      number: cloNumberOffset + cloData.number,
      title: cloData.title,
      description: cloData.description || "",
      programLearningOutcomes: ploIds,
      isActive: true,
    });

    cloIdByGeneratedNumber[cloData.number] = savedCLO._id;
    createdCLOIds.push(String(savedCLO._id));
  }

  // Determine next LLO periodOrder/weekOrder offset to avoid collisions
  const lastLLO = await LLO.findOne().sort({ periodOrder: -1, weekOrder: -1, order: -1 }).lean();

  // Save generated LLOs
  const generatedLLOs = outcomesData.llos || [];
  let lloCount = 0;

  // Process LLOs in order
  const sortedLLOs = [...generatedLLOs].sort(
    (a, b) => a.periodOrder - b.periodOrder || a.weekOrder - b.weekOrder || a.order - b.order
  );

  for (const lloData of sortedLLOs) {
    const cloIds = (lloData.cloNumbers || [])
      .map((n) => cloIdByGeneratedNumber[n])
      .filter(Boolean);

    await LLO.create({
      text: lloData.text,
      domain: lloData.domain || "K",
      period: lloData.period || "PRELIM",
      weekLabel: lloData.weekLabel || "FIRST WEEK",
      periodOrder: lloData.periodOrder || 1,
      weekOrder: lloData.weekOrder || 1,
      order: lloData.order || 1,
      courseLearningOutcomes: cloIds,
      isActive: true,
    });
    lloCount++;
  }

  return {
    ...syllabusFields,
    createdCLOIds,
    cloCount: createdCLOIds.length,
    lloCount,
  };
};

module.exports = { generateSyllabusContent };
