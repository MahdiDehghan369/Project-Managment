const {Router} = require('express');
const router = Router()

const authMiddleware = require('./../../middlewares/auth');
const checkPermission = require('./../../middlewares/checkPermission');
const { createProject, getProject } = require('./project.ctrl');
const { upload } = require("../../middlewares/imageUploader");

router.route("/").post(authMiddleware , checkPermission("create.project"), upload.single("cover") , createProject)

router
  .route("/:projectId")
  .get(authMiddleware, checkPermission("get.project"), getProject);

module.exports = router