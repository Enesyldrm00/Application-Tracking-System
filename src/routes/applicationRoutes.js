const express = require("express");
const router = express.Router();
const applicationControllers = require("../controllers/applicationControllers");
const authMiddleware = require("../middlewares/authMiddleware");
const roleCheckMiddleware = require("../middlewares/roleCheckMiddleware");

router.post("/create",authMiddleware,applicationControllers.createApplication);
router.get("/get",authMiddleware,applicationControllers.usersGetApplication);
router.get("/allGet",authMiddleware,roleCheckMiddleware,applicationControllers.adminGetApplication);

module.exports = router;