const express = require("express");
const router = express.Router();
const aiController = require("./controller");

router.post("/generate-syllabus", aiController.generateSyllabus);

module.exports = router;
