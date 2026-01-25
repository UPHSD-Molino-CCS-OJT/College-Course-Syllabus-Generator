const BrandingSettings = require("./model");

exports.getSettings = async () => {
  // Get the first (and should be only) settings document
  let settings = await BrandingSettings.findOne();
  
  // If no settings exist, create default ones
  if (!settings) {
    settings = await BrandingSettings.create({
      institutionName: "College Name",
      headerText: "",
      footerText: "",
      primaryColor: "#1E40AF",
      secondaryColor: "#3B82F6",
      fontSize: "medium",
      fontFamily: "Arial, sans-serif",
    });
  }
  
  return settings;
};

exports.createSettings = async (settingsData) => {
  // Check if settings already exist
  const existingSettings = await BrandingSettings.findOne();
  if (existingSettings) {
    throw new Error("Settings already exist. Use update instead.");
  }
  
  return BrandingSettings.create(settingsData);
};

exports.updateSettings = async (settingsData) => {
  // Get existing settings or create new ones
  let settings = await BrandingSettings.findOne();
  
  if (!settings) {
    // If no settings exist, create them
    return BrandingSettings.create(settingsData);
  }
  
  // Update existing settings
  const result = await BrandingSettings.findByIdAndUpdate(
    settings._id,
    settingsData,
    {
      new: true,
      runValidators: true,
    }
  );
  
  return result;
};
