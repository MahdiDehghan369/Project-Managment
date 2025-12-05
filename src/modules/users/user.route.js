const { Router } = require("express");
const {
  createUser,
  getUsers,
  getUser,
  editUserByAdmin,
  removeUser,
} = require("./user.ctrl");
const authMiddleware = require("../../middlewares/auth");
const checkPermission = require("../../middlewares/checkPermission");
const router = Router();

router
  .route("/")
  .post(authMiddleware, checkPermission("create.user"), createUser)
  .get(authMiddleware, checkPermission("get.users"), getUsers);
router
  .route("/:userId")
  .get(authMiddleware, checkPermission("get.user"), getUser)
  .put(authMiddleware, checkPermission("edit.user"), editUserByAdmin)
  .delete(authMiddleware , checkPermission("remove.user") , removeUser)

module.exports = router;
