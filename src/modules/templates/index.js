const express = require("express");
const router = express.Router();
const templateController = require("./controller");

// Template routes
router.post("/", templateController.createTemplate);
router.get("/", templateController.getTemplates);
router.get("/default", templateController.getDefaultTemplate);
router.get("/:id", templateController.getTemplateById);
router.put("/:id", templateController.updateTemplateById);
router.delete("/:id", templateController.deleteTemplateById);
router.patch("/:id/set-default", templateController.setDefaultTemplate);

module.exports = router;
