const CLO = require("./model");

exports.getAllCLOs = async (query) => {
  const { page = 1, limit = 20, isActive } = query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === "true";

  return CLO.find(filter)
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .sort({ number: 1 })
    .populate({
      path: "programLearningOutcomes",
      select: "number title",
    })
    .exec();
};

exports.getCLOById = async (id) => {
  return CLO.findById(id)
    .populate({
      path: "programLearningOutcomes",
      select: "number title",
    })
    .exec();
};

exports.createCLO = async (data) => {
  return CLO.create(data);
};

exports.updateCLO = async (id, data) => {
  return CLO.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate({
    path: "programLearningOutcomes",
    select: "number title",
  });
};

exports.deleteCLO = async (id) => {
  return CLO.findByIdAndDelete(id);
};

exports.countCLOs = async (filter = {}) => {
  return CLO.countDocuments(filter);
};
