const MissionKeyword = require("./model");

exports.getAllMissionKeywords = async (query) => {
  const { page = 1, limit = 20, isActive } = query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === "true";

  return MissionKeyword.find(filter)
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .sort({ code: 1 })
    .exec();
};

exports.getMissionKeywordById = async (id) => {
  return MissionKeyword.findById(id).exec();
};

exports.createMissionKeyword = async (data) => {
  return MissionKeyword.create(data);
};

exports.updateMissionKeyword = async (id, data) => {
  return MissionKeyword.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

exports.deleteMissionKeyword = async (id) => {
  return MissionKeyword.findByIdAndDelete(id);
};

exports.countMissionKeywords = async (filter = {}) => {
  return MissionKeyword.countDocuments(filter);
};
