const express = require("express");
const router = express.Router();
const dieController = require("../controllers/die.controller");

router.post("/", dieController.createDie);
router.get("/", dieController.getAllDies);
router.get("/:id", dieController.getDieById);
router.put("/:id", dieController.updateDie);
router.delete("/:id", dieController.deleteDie);

module.exports = router;
