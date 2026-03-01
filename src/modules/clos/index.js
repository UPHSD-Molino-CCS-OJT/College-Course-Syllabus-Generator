const router = require("express").Router();
const cloController = require("./controller");

// Create a new CLO
router.post("/", cloController.createCLO);

// Get all CLOs
router.get("/", cloController.getAllCLOs);

// Get a specific CLO by ID
router.get("/:id", cloController.getCLOById);

// Update a CLO by ID
router.patch("/:id", cloController.updateCLOById);

// Delete a CLO by ID
router.delete("/:id", cloController.deleteCLOById);

module.exports = router;
