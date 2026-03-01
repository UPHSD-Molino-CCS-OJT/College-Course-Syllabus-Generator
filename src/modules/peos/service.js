const PEO = require("./model");

exports.getAllPEOs = async (query) => {
  const { page = 1, limit = 20, isActive } = query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === "true";

  return PEO.find(filter)
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .sort({ number: 1 })
    .populate({
      path: "graduateAttributes",
      select: "number category title",
    })
    .exec();
};

exports.getPEOById = async (id) => {
  return PEO.findById(id)
    .populate({
      path: "graduateAttributes",
      select: "number category title",
    })
    .exec();
};

exports.createPEO = async (data) => {
  return PEO.create(data);
};

exports.updatePEO = async (id, data) => {
  return PEO.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate({
    path: "graduateAttributes",
    select: "number category title",
  });
};

exports.deletePEO = async (id) => {
  return PEO.findByIdAndDelete(id);
};

exports.countPEOs = async (filter = {}) => {
  return PEO.countDocuments(filter);
};
