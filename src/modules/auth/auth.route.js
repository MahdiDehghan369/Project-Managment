const { Router } = require("express");
const authMiddleware = require("../../middlewares/auth");
const checkPermission = require("../../middlewares/checkPermission");
const { login } = require("./auth.ctrl");
const router = Router();

router
  .route("/login")
  .post(login);

module.exports = router;
