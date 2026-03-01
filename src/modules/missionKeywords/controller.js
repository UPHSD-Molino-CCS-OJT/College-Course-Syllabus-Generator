const missionKeywordService = require("./service");

exports.createMissionKeyword = async (req, res) => {
  try {
    const newKeyword = await missionKeywordService.createMissionKeyword(req.body);

    res.status(201).json({
      status: "success",
      message: "Mission keyword created successfully.",
      data: { missionKeyword: newKeyword },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to create mission keyword",
    });
  }
};

exports.getAllMissionKeywords = async (req, res) => {
  try {
    const keywords = await missionKeywordService.getAllMissionKeywords(req.query);
    const total = await missionKeywordService.countMissionKeywords();

    res.status(200).json({
      status: "success",
      data: {
        missionKeywords: keywords,
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
      message: "Failed to fetch mission keywords",
    });
  }
};

exports.getMissionKeywordById = async (req, res) => {
  try {
    const keyword = await missionKeywordService.getMissionKeywordById(req.params.id);

    if (!keyword) {
      return res.status(404).json({
        status: "error",
        message: "Mission keyword not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { missionKeyword: keyword },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch mission keyword",
    });
  }
};

exports.updateMissionKeywordById = async (req, res) => {
  try {
    const updated = await missionKeywordService.updateMissionKeyword(
      req.params.id,
      req.body
    );

    if (!updated) {
      return res.status(404).json({
        status: "error",
        message: "Mission keyword not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Mission keyword updated successfully.",
      data: { missionKeyword: updated },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to update mission keyword",
    });
  }
};

exports.deleteMissionKeywordById = async (req, res) => {
  try {
    const deleted = await missionKeywordService.deleteMissionKeyword(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        status: "error",
        message: "Mission keyword not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Mission keyword deleted successfully.",
      data: { missionKeyword: deleted },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to delete mission keyword",
    });
  }
};
