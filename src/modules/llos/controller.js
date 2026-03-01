const lloService = require("./service");

exports.createLLO = async (req, res) => {
  try {
    const newLLO = await lloService.createLLO(req.body);

    res.status(201).json({
      status: "success",
      message: "Lesson Learning Outcome created successfully.",
      data: { llo: newLLO },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to create Lesson Learning Outcome",
    });
  }
};

exports.getAllLLOs = async (req, res) => {
  try {
    const llos = await lloService.getAllLLOs(req.query);
    const total = await lloService.countLLOs();

    res.status(200).json({
      status: "success",
      data: {
        llos,
        pagination: {
          total,
          page: parseInt(req.query.page) || 1,
          limit: parseInt(req.query.limit) || 100,
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch Lesson Learning Outcomes",
    });
  }
};

exports.getLLOById = async (req, res) => {
  try {
    const llo = await lloService.getLLOById(req.params.id);

    if (!llo) {
      return res.status(404).json({
        status: "error",
        message: "Lesson Learning Outcome not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { llo },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch Lesson Learning Outcome",
    });
  }
};

exports.updateLLOById = async (req, res) => {
  try {
    const updated = await lloService.updateLLO(req.params.id, req.body);

    if (!updated) {
      return res.status(404).json({
        status: "error",
        message: "Lesson Learning Outcome not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Lesson Learning Outcome updated successfully.",
      data: { llo: updated },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to update Lesson Learning Outcome",
    });
  }
};

exports.deleteLLOById = async (req, res) => {
  try {
    const deleted = await lloService.deleteLLO(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        status: "error",
        message: "Lesson Learning Outcome not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Lesson Learning Outcome deleted successfully.",
      data: { llo: deleted },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to delete Lesson Learning Outcome",
    });
  }
};
