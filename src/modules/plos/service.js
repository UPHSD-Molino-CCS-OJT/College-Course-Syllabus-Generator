const PLO = require("./model");

exports.getAllPLOs = async (query) => {
  const { page = 1, limit = 20, isActive } = query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === "true";

  return PLO.find(filter)
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .sort({ number: 1 })
    .populate({
      path: "programEducationalObjectives",
      select: "number title",
    })
    .exec();
};

exports.getPLOById = async (id) => {
  return PLO.findById(id)
    .populate({
      path: "programEducationalObjectives",
      select: "number title",
    })
    .exec();
};

exports.createPLO = async (data) => {
  return PLO.create(data);
};

exports.updatePLO = async (id, data) => {
  return PLO.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate({
    path: "programEducationalObjectives",
    select: "number title",
  });
};

exports.deletePLO = async (id) => {
  return PLO.findByIdAndDelete(id);
};

exports.countPLOs = async (filter = {}) => {
  return PLO.countDocuments(filter);
};
