const {Router} = require('express');
const router = Router()

const authMiddleware = require('./../../middlewares/auth');
const checkPermission = require('./../../middlewares/checkPermission');
const { createProject, getProject, removeProject, editProject } = require('./project.ctrl');
const { upload } = require("../../middlewares/imageUploader");

router.route("/").post(authMiddleware , checkPermission("create.project"), upload.single("cover") , createProject)

router
  .route("/:projectId")
  .get(authMiddleware, checkPermission("get.project"), getProject)
  .delete(authMiddleware , checkPermission("remove.project") , removeProject)
  .put(authMiddleware , checkPermission("edit.project"), upload.single("cover") , editProject)

module.exports = router