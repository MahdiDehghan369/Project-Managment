const { Router } = require("express");
const {
  createUser,
  getUsers,
  getUser,
  editUserByAdmin,
  removeUser,
  editUser,
  assignRole,
} = require("./user.ctrl");
const authMiddleware = require("../../middlewares/auth");
const checkPermission = require("../../middlewares/checkPermission");
const {upload} = require("../../middlewares/imageUploader");
const router = Router();

router
  .route("/")
  .post(authMiddleware, checkPermission("create.user"), createUser)
  .get(authMiddleware, checkPermission("get.users"), getUsers)
  .put(authMiddleware , upload.single("avatar") ,editUser)
router
  .route("/:userId")
  .get(authMiddleware, checkPermission("get.user"), getUser)
  .put(authMiddleware, checkPermission("edit.user"), editUserByAdmin)
  .delete(authMiddleware , checkPermission("remove.user") , removeUser)
router.route("/:userId/role").patch(authMiddleware , checkPermission("assign.role") , assignRole)

module.exports = router;
