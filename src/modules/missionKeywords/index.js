const router = require("express").Router();
const missionKeywordController = require("./controller");

// Create a new mission keyword
router.post("/", missionKeywordController.createMissionKeyword);

// Get all mission keywords
router.get("/", missionKeywordController.getAllMissionKeywords);

// Get a specific mission keyword by ID
router.get("/:id", missionKeywordController.getMissionKeywordById);

// Update a mission keyword by ID
router.patch("/:id", missionKeywordController.updateMissionKeywordById);

// Delete a mission keyword by ID
router.delete("/:id", missionKeywordController.deleteMissionKeywordById);

module.exports = router;
