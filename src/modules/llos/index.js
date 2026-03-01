const router = require("express").Router();
const lloController = require("./controller");

// Create a new LLO
router.post("/", lloController.createLLO);

// Get all LLOs
router.get("/", lloController.getAllLLOs);

// Get a specific LLO by ID
router.get("/:id", lloController.getLLOById);

// Update a LLO by ID
router.patch("/:id", lloController.updateLLOById);

// Delete a LLO by ID
router.delete("/:id", lloController.deleteLLOById);

module.exports = router;
