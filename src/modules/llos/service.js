const LLO = require("./model");

exports.getAllLLOs = async (query) => {
  const { page = 1, limit = 100, isActive, period } = query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (period) filter.period = period;

  return LLO.find(filter)
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .sort({ periodOrder: 1, weekOrder: 1, order: 1 })
    .populate({
      path: "courseLearningOutcomes",
      select: "number title",
    })
    .exec();
};

exports.getLLOById = async (id) => {
  return LLO.findById(id)
    .populate({
      path: "courseLearningOutcomes",
      select: "number title",
    })
    .exec();
};

exports.createLLO = async (data) => {
  return LLO.create(data);
};

exports.updateLLO = async (id, data) => {
  return LLO.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .populate({
      path: "courseLearningOutcomes",
      select: "number title",
    })
    .exec();
};

exports.deleteLLO = async (id) => {
  return LLO.findByIdAndDelete(id);
};

exports.countLLOs = async (filter = {}) => {
  return LLO.countDocuments(filter);
};
