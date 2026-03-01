const ploService = require("./service");

exports.createPLO = async (req, res) => {
  try {
    const newPLO = await ploService.createPLO(req.body);

    res.status(201).json({
      status: "success",
      message: "Program Learning Outcome created successfully.",
      data: { plo: newPLO },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to create Program Learning Outcome",
    });
  }
};

exports.getAllPLOs = async (req, res) => {
  try {
    const plos = await ploService.getAllPLOs(req.query);
    const total = await ploService.countPLOs();

    res.status(200).json({
      status: "success",
      data: {
        plos,
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
      message: "Failed to fetch Program Learning Outcomes",
    });
  }
};

exports.getPLOById = async (req, res) => {
  try {
    const plo = await ploService.getPLOById(req.params.id);

    if (!plo) {
      return res.status(404).json({
        status: "error",
        message: "Program Learning Outcome not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { plo },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch Program Learning Outcome",
    });
  }
};

exports.updatePLOById = async (req, res) => {
  try {
    const updated = await ploService.updatePLO(req.params.id, req.body);

    if (!updated) {
      return res.status(404).json({
        status: "error",
        message: "Program Learning Outcome not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Program Learning Outcome updated successfully.",
      data: { plo: updated },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to update Program Learning Outcome",
    });
  }
};

exports.deletePLOById = async (req, res) => {
  try {
    const deleted = await ploService.deletePLO(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        status: "error",
        message: "Program Learning Outcome not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Program Learning Outcome deleted successfully.",
      data: { plo: deleted },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to delete Program Learning Outcome",
    });
  }
};
