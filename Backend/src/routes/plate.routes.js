const express = require("express");
const router = express.Router();
const plateController = require("../controllers/plate.controller");

router.post("/", plateController.createPlate);
router.get("/", plateController.getAllPlates);
router.get("/:id", plateController.getPlateById);
router.put("/:id", plateController.updatePlate);
router.delete("/:id", plateController.deletePlate);

module.exports = router;
