const { Router } = require("express");
const { createUser } = require("./user.ctrl");
const authMiddleware = require("../../middlewares/auth");
const checkPermission = require("../../middlewares/checkPermission");
const router = Router();

router.route("/").post(authMiddleware , checkPermission("create.user") , createUser)

module.exports = router;
