const { Router } = require("express");
const authMiddleware = require("../../middlewares/auth");
const checkPermission = require("../../middlewares/checkPermission");
const { login, getMe, refreshToken, logout } = require("./auth.ctrl");
const router = Router();

router
  .route("/login")
  .post(login);

router.route("/me").get(authMiddleware , getMe)
router.route("/refresh-token").post(authMiddleware , refreshToken)
router.route("/logout").post(authMiddleware , logout)

module.exports = router;
