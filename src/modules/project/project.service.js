const path = require('path');
const { saveFile } = require("../../middlewares/imageUploader");
const { unlinkAsync } = require("../../utils/asyncFs");
const Transaction = require("./../../utils/transaction");
const projectRepo = require("./project.repo");
const createError = require('../../utils/createError');
const { getProjectById } = require('../../cache/project.cache');

const createProjectHandler = async (userId, data, coverFile) => {
  const transaction = new Transaction();
  let project = null;
  let coverPath = null;

  transaction.addStep(
    "writeCover",
    async () => {
      if (coverFile) {
        coverPath = await saveFile(coverFile, "project-cover");
      }
    },
    async () => {
      if (!coverPath) return;
      const filePath = path.join(
        __dirname,
        "..",
        "..",
        "..",
        "public",
        coverPath
      );
      await unlinkAsync(filePath);
    }
  );

  transaction.addStep(
    "createProject",
    async () => {
      project = await projectRepo.create({
        ...data,
        createdBy: userId,
        cover: coverPath,
      });
    },
    async () => {
      if (project) {
        await projectRepo.remove(project._id);
      }
    }
  );

  await transaction.executeSequential();
  return project;
};

const getProjectHandler = async(projectId) => {
    const project = await getProjectById(projectId)
    if(!project){
        throw createError(404, "Project not found :)")
    }
    return project
}

module.exports = {
  createProjectHandler,
  getProjectHandler,
};
