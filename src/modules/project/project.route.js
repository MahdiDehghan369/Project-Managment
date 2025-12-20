const { Router } = require('express');
const router = Router()

const authMiddleware = require('./../../middlewares/auth');
const checkPermission = require('./../../middlewares/checkPermission');
const { createProject, getProject, removeProject, editProject, getProjects, addUserToProject, removeUserFromProject, getProjectMembers, getUserProjectPermissions } = require('./project.ctrl');
const { upload } = require("../../middlewares/imageUploader");

router.route("/").post(authMiddleware, checkPermission("create.project"), upload.single("cover"), createProject).get(authMiddleware, checkPermission("get.all.projects"), getProjects)

router
  .route("/:projectId")
  .get(authMiddleware, checkPermission("get.project"), getProject)
  .delete(authMiddleware, checkPermission("remove.project"), removeProject)
  .put(authMiddleware, checkPermission("edit.project"), upload.single("cover"), editProject)

router.route("/:projectId/members").post(authMiddleware, checkPermission("add.member.project"), addUserToProject).get(authMiddleware, checkPermission("get.members.project"), getProjectMembers)

router.route("/:projectId/members/:userId").delete(authMiddleware, checkPermission("remove.member.project"), removeUserFromProject)

router.route("/:projectId/members/:userId/permissions").get(authMiddleware , checkPermission("get.user.permissions.project") , getUserProjectPermissions)


module.exports = router