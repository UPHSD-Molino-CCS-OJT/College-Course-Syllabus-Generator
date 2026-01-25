const router = require("express").Router();
const syllabusController = require("./controller");

// Create a new syllabus
router.post("/", syllabusController.createSyllabus);

// Get all syllabi (with optional filters and pagination)
router.get("/", syllabusController.getAllSyllabi);

// Get syllabi by semester and academic year
router.get("/semester/:semester/:academicYear", syllabusController.getSyllabusBySemester);

// Get a specific syllabus by ID
router.get("/:id", syllabusController.getSyllabusById);

// Update a syllabus by ID
router.patch("/:id", syllabusController.updateSyllabusById);

// Delete a syllabus by ID
router.delete("/:id", syllabusController.deleteSyllabusById);

module.exports = router;
