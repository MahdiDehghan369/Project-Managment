const { Router } = require("express");
const {
  createUser,
  getUsers,
  getUser,
  editUserByAdmin,
  removeUser,
  editUser,
} = require("./user.ctrl");
const authMiddleware = require("../../middlewares/auth");
const checkPermission = require("../../middlewares/checkPermission");
const imageUploader = require("../../middlewares/imageUploader");
const router = Router();

router
  .route("/")
  .post(authMiddleware, checkPermission("create.user"), createUser)
  .get(authMiddleware, checkPermission("get.users"), getUsers)
  .put(authMiddleware , imageUploader.single("avatar") ,editUser)
router
  .route("/:userId")
  .get(authMiddleware, checkPermission("get.user"), getUser)
  .put(authMiddleware, checkPermission("edit.user"), editUserByAdmin)
  .delete(authMiddleware , checkPermission("remove.user") , removeUser)

module.exports = router;
