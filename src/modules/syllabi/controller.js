const syllabusService = require("./service");

exports.createSyllabus = async (req, res, next) => {
  try {
    const syllabusData = req.body;
    const newSyllabus = await syllabusService.createSyllabus(syllabusData);

    res.status(201).json({
      status: "success",
      message: "Syllabus created successfully.",
      data: {
        syllabus: newSyllabus,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to create syllabus",
    });
  }
};

exports.getAllSyllabi = async (req, res, next) => {
  try {
    const syllabi = await syllabusService.getSyllabi(req.query);
    const total = await syllabusService.countSyllabi();

    res.status(200).json({
      status: "success",
      data: {
        syllabi,
        pagination: {
          total,
          page: parseInt(req.query.page) || 1,
          limit: parseInt(req.query.limit) || 10,
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch syllabi",
    });
  }
};

exports.getSyllabusById = async (req, res, next) => {
  try {
    const syllabus = await syllabusService.getSyllabusById(req.params.id);

    if (!syllabus) {
      return res.status(404).json({
        status: "error",
        message: "Syllabus not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        syllabus,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch syllabus",
    });
  }
};

exports.updateSyllabusById = async (req, res, next) => {
  try {
    const updatedSyllabus = await syllabusService.updateSyllabus(
      req.params.id,
      req.body
    );

    if (!updatedSyllabus) {
      return res.status(404).json({
        status: "error",
        message: "Syllabus not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Syllabus updated successfully.",
      data: {
        syllabus: updatedSyllabus,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Failed to update syllabus",
    });
  }
};

exports.deleteSyllabusById = async (req, res, next) => {
  try {
    const deletedSyllabus = await syllabusService.deleteSyllabus(req.params.id);

    if (!deletedSyllabus) {
      return res.status(404).json({
        status: "error",
        message: "Syllabus not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Syllabus deleted successfully.",
      data: {
        syllabus: deletedSyllabus,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete syllabus",
    });
  }
};

exports.getSyllabusBySemester = async (req, res, next) => {
  try {
    const { semester, academicYear } = req.params;
    const syllabi = await syllabusService.getSyllabusBySemester(semester, academicYear);

    res.status(200).json({
      status: "success",
      data: {
        syllabi,
        count: syllabi.length,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch syllabi by semester",
    });
  }
};
