const peoService = require("./service");

exports.createPEO = async (req, res) => {
  try {
    const newPEO = await peoService.createPEO(req.body);

    res.status(201).json({
      status: "success",
      message: "Program Educational Objective created successfully.",
      data: { peo: newPEO },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to create Program Educational Objective",
    });
  }
};

exports.getAllPEOs = async (req, res) => {
  try {
    const peos = await peoService.getAllPEOs(req.query);
    const total = await peoService.countPEOs();

    res.status(200).json({
      status: "success",
      data: {
        peos,
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
      message: "Failed to fetch Program Educational Objectives",
    });
  }
};

exports.getPEOById = async (req, res) => {
  try {
    const peo = await peoService.getPEOById(req.params.id);

    if (!peo) {
      return res.status(404).json({
        status: "error",
        message: "Program Educational Objective not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { peo },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch Program Educational Objective",
    });
  }
};

exports.updatePEOById = async (req, res) => {
  try {
    const updated = await peoService.updatePEO(req.params.id, req.body);

    if (!updated) {
      return res.status(404).json({
        status: "error",
        message: "Program Educational Objective not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Program Educational Objective updated successfully.",
      data: { peo: updated },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to update Program Educational Objective",
    });
  }
};

exports.deletePEOById = async (req, res) => {
  try {
    const deleted = await peoService.deletePEO(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        status: "error",
        message: "Program Educational Objective not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Program Educational Objective deleted successfully.",
      data: { peo: deleted },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to delete Program Educational Objective",
    });
  }
};
