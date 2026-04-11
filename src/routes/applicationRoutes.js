const express = require("express");
const router = express.Router();
const applicationControllers = require("../controllers/applicationControllers");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/create",authMiddleware,applicationControllers.createApplication);

module.exports = router;