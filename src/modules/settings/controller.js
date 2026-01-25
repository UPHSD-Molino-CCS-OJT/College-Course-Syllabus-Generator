const settingsService = require("./service");

exports.getSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings();

    res.status(200).json({
      status: "success",
      data: {
        settings,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: err.message || "Failed to retrieve settings",
    });
  }
};

exports.createSettings = async (req, res, next) => {
  try {
    const settingsData = req.body;
    const newSettings = await settingsService.createSettings(settingsData);

    res.status(201).json({
      status: "success",
      message: "Settings created successfully.",
      data: {
        settings: newSettings,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      status: "error",
      message: err.message || "Failed to create settings",
    });
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const settingsData = req.body;
    const updatedSettings = await settingsService.updateSettings(settingsData);

    res.status(200).json({
      status: "success",
      message: "Settings updated successfully.",
      data: {
        settings: updatedSettings,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      status: "error",
      message: err.message || "Failed to update settings",
    });
  }
};
