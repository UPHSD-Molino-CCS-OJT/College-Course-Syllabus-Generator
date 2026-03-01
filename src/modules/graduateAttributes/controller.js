const graduateAttributeService = require("./service");

exports.createGraduateAttribute = async (req, res) => {
  try {
    const newGA = await graduateAttributeService.createGraduateAttribute(req.body);

    res.status(201).json({
      status: "success",
      message: "Graduate attribute created successfully.",
      data: { graduateAttribute: newGA },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to create graduate attribute",
    });
  }
};

exports.getAllGraduateAttributes = async (req, res) => {
  try {
    const attributes = await graduateAttributeService.getAllGraduateAttributes(req.query);
    const total = await graduateAttributeService.countGraduateAttributes();

    res.status(200).json({
      status: "success",
      data: {
        graduateAttributes: attributes,
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
      message: "Failed to fetch graduate attributes",
    });
  }
};

exports.getGraduateAttributeById = async (req, res) => {
  try {
    const attribute = await graduateAttributeService.getGraduateAttributeById(req.params.id);

    if (!attribute) {
      return res.status(404).json({
        status: "error",
        message: "Graduate attribute not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { graduateAttribute: attribute },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch graduate attribute",
    });
  }
};

exports.updateGraduateAttributeById = async (req, res) => {
  try {
    const updated = await graduateAttributeService.updateGraduateAttribute(
      req.params.id,
      req.body
    );

    if (!updated) {
      return res.status(404).json({
        status: "error",
        message: "Graduate attribute not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Graduate attribute updated successfully.",
      data: { graduateAttribute: updated },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to update graduate attribute",
    });
  }
};

exports.deleteGraduateAttributeById = async (req, res) => {
  try {
    const deleted = await graduateAttributeService.deleteGraduateAttribute(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        status: "error",
        message: "Graduate attribute not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Graduate attribute deleted successfully.",
      data: { graduateAttribute: deleted },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to delete graduate attribute",
    });
  }
};
