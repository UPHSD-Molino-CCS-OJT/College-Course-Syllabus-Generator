const router = require("express").Router();
const peoController = require("./controller");

// Create a new PEO
router.post("/", peoController.createPEO);

// Get all PEOs
router.get("/", peoController.getAllPEOs);

// Get a specific PEO by ID
router.get("/:id", peoController.getPEOById);

// Update a PEO by ID
router.patch("/:id", peoController.updatePEOById);

// Delete a PEO by ID
router.delete("/:id", peoController.deletePEOById);

module.exports = router;
