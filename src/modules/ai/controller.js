const aiService = require("./service");

const generateSyllabus = async (req, res) => {
  try {
    const { courseTitle, courseCode, department, credits, existingCLOIds } = req.body;

    if (!courseTitle) {
      return res.status(400).json({ status: "error", message: "courseTitle is required" });
    }

    const generated = await aiService.generateSyllabusContent({
      courseTitle,
      courseCode,
      department,
      credits,
      existingCLOIds: existingCLOIds || [],
    });

    res.status(200).json({ status: "success", data: { generated } });
  } catch (err) {
    console.error("AI generation error:", err);
    res.status(500).json({ status: "error", message: err.message || "AI generation failed" });
  }
};

module.exports = { generateSyllabus };
