const cloService = require("./service");

exports.createCLO = async (req, res) => {
  try {
    const newCLO = await cloService.createCLO(req.body);

    res.status(201).json({
      status: "success",
      message: "Course Learning Outcome created successfully.",
      data: { clo: newCLO },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to create Course Learning Outcome",
    });
  }
};

exports.getAllCLOs = async (req, res) => {
  try {
    const clos = await cloService.getAllCLOs(req.query);
    const total = await cloService.countCLOs();

    res.status(200).json({
      status: "success",
      data: {
        clos,
        pagination: {
          total,
          page: parseInt(req.query.page) || 1,
          limit: parseInt(req.query.limit) || 20,
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch Course Learning Outcomes",
    });
  }
};

exports.getCLOById = async (req, res) => {
  try {
    const clo = await cloService.getCLOById(req.params.id);

    if (!clo) {
      return res.status(404).json({
        status: "error",
        message: "Course Learning Outcome not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { clo },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch Course Learning Outcome",
    });
  }
};

exports.updateCLOById = async (req, res) => {
  try {
    const updated = await cloService.updateCLO(req.params.id, req.body);

    if (!updated) {
      return res.status(404).json({
        status: "error",
        message: "Course Learning Outcome not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Course Learning Outcome updated successfully.",
      data: { clo: updated },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to update Course Learning Outcome",
    });
  }
};

exports.deleteCLOById = async (req, res) => {
  try {
    const deleted = await cloService.deleteCLO(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        status: "error",
        message: "Course Learning Outcome not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Course Learning Outcome deleted successfully.",
      data: { clo: deleted },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to delete Course Learning Outcome",
    });
  }
};
