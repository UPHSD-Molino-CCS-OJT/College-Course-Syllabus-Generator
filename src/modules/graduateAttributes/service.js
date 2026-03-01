const GraduateAttribute = require("./model");

exports.getAllGraduateAttributes = async (query) => {
  const { page = 1, limit = 20, category, isActive } = query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (category) filter.category = category;
  if (isActive !== undefined) filter.isActive = isActive === "true";

  return GraduateAttribute.find(filter)
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .sort({ number: 1 })
    .populate("missionKeywords", "code label")
    .exec();
};

exports.getGraduateAttributeById = async (id) => {
  return GraduateAttribute.findById(id)
    .populate("missionKeywords", "code label")
    .exec();
};

exports.createGraduateAttribute = async (data) => {
  return GraduateAttribute.create(data);
};

exports.updateGraduateAttribute = async (id, data) => {
  return GraduateAttribute.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate("missionKeywords", "code label");
};

exports.deleteGraduateAttribute = async (id) => {
  return GraduateAttribute.findByIdAndDelete(id);
};

exports.countGraduateAttributes = async (filter = {}) => {
  return GraduateAttribute.countDocuments(filter);
};
