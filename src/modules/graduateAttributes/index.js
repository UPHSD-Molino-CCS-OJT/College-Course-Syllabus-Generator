const router = require("express").Router();
const graduateAttributeController = require("./controller");

// Create a new graduate attribute
router.post("/", graduateAttributeController.createGraduateAttribute);

// Get all graduate attributes
router.get("/", graduateAttributeController.getAllGraduateAttributes);

// Get a specific graduate attribute by ID
router.get("/:id", graduateAttributeController.getGraduateAttributeById);

// Update a graduate attribute by ID
router.patch("/:id", graduateAttributeController.updateGraduateAttributeById);

// Delete a graduate attribute by ID
router.delete("/:id", graduateAttributeController.deleteGraduateAttributeById);

module.exports = router;
