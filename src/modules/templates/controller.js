const templateService = require("./service");

// Create a new template
exports.createTemplate = async (req, res) => {
  try {
    const templateData = req.body;
    const newTemplate = await templateService.createTemplate(templateData);

    res.status(201).json({
      status: "success",
      message: "Template created successfully",
      data: { template: newTemplate },
    });
  } catch (error) {
    console.error("Error creating template:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create template",
    });
  }
};

// Get all templates
exports.getTemplates = async (req, res) => {
  try {
    const result = await templateService.getTemplates(req.query);

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch templates",
    });
  }
};

// Get template by ID
exports.getTemplateById = async (req, res) => {
  try {
    const template = await templateService.getTemplateById(req.params.id);

    if (!template) {
      return res.status(404).json({
        status: "error",
        message: "Template not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { template },
    });
  } catch (error) {
    console.error("Error fetching template:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch template",
    });
  }
};

// Update template
exports.updateTemplateById = async (req, res) => {
  try {
    const updatedTemplate = await templateService.updateTemplateById(
      req.params.id,
      req.body
    );

    if (!updatedTemplate) {
      return res.status(404).json({
        status: "error",
        message: "Template not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Template updated successfully",
      data: { template: updatedTemplate },
    });
  } catch (error) {
    console.error("Error updating template:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update template",
    });
  }
};

// Delete template
exports.deleteTemplateById = async (req, res) => {
  try {
    const deletedTemplate = await templateService.deleteTemplateById(req.params.id);

    if (!deletedTemplate) {
      return res.status(404).json({
        status: "error",
        message: "Template not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting template:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete template",
    });
  }
};

// Set default template
exports.setDefaultTemplate = async (req, res) => {
  try {
    const template = await templateService.setDefaultTemplate(req.params.id);

    if (!template) {
      return res.status(404).json({
        status: "error",
        message: "Template not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Default template set successfully",
      data: { template },
    });
  } catch (error) {
    console.error("Error setting default template:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to set default template",
    });
  }
};

// Get default template
exports.getDefaultTemplate = async (req, res) => {
  try {
    const template = await templateService.getDefaultTemplate();

    if (!template) {
      return res.status(404).json({
        status: "error",
        message: "No default template found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { template },
    });
  } catch (error) {
    console.error("Error fetching default template:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch default template",
    });
  }
};
