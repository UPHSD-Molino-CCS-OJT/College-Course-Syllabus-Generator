const Template = require("./model");

// Create a new template
exports.createTemplate = async (templateData) => {
  const template = new Template(templateData);
  return await template.save();
};

// Get all templates with pagination and filtering
exports.getTemplates = async (query) => {
  const { page = 1, limit = 12, category, isDefault } = query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (category) filter.category = category;
  if (isDefault !== undefined) filter.isDefault = isDefault === "true";

  const templates = await Template.find(filter)
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 });

  const total = await Template.countDocuments(filter);

  return {
    templates,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit),
  };
};

// Get template by ID
exports.getTemplateById = async (id) => {
  return await Template.findById(id);
};

// Update template
exports.updateTemplateById = async (id, updateData) => {
  return await Template.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

// Delete template
exports.deleteTemplateById = async (id) => {
  return await Template.findByIdAndDelete(id);
};

// Set default template
exports.setDefaultTemplate = async (id) => {
  // Remove default flag from all templates
  await Template.updateMany({}, { isDefault: false });
  
  // Set the new default
  return await Template.findByIdAndUpdate(
    id,
    { isDefault: true },
    { new: true, runValidators: true }
  );
};

// Get default template
exports.getDefaultTemplate = async () => {
  return await Template.findOne({ isDefault: true });
};
