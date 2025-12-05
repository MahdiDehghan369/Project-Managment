const { Router } = require("express");
const authMiddleware = require("../../middlewares/auth");
const checkPermission = require("../../middlewares/checkPermission");
const { login, getMe } = require("./auth.ctrl");
const router = Router();

router
  .route("/login")
  .post(login);

router.route("/me").get(authMiddleware , getMe)

module.exports = router;
