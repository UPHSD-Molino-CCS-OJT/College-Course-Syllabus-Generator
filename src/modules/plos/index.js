const router = require("express").Router();
const ploController = require("./controller");

// Create a new PLO
router.post("/", ploController.createPLO);

// Get all PLOs
router.get("/", ploController.getAllPLOs);

// Get a specific PLO by ID
router.get("/:id", ploController.getPLOById);

// Update a PLO by ID
router.patch("/:id", ploController.updatePLOById);

// Delete a PLO by ID
router.delete("/:id", ploController.deletePLOById);

module.exports = router;
