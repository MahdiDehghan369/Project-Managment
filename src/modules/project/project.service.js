const path = require("path");
const { saveFile } = require("../../middlewares/imageUploader");
const { unlinkAsync } = require("../../utils/asyncFs");
const Transaction = require("./../../utils/transaction");
const projectRepo = require("./project.repo");
const createError = require("../../utils/createError");
const { getProjectById } = require("../../cache/project.cache");
const { getUserById } = require("../../cache/user.cache");
const getPublicPath = require("../../utils/getPublicPath");
const { cacheService } = require("../../services/redis");
const projectMemberRepo = require("../project_members/project-members.repo");

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
      const filePath = getPublicPath(coverPath)
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

const getProjectHandler = async (projectId) => {
  const project = await getProjectById(projectId);
  if (!project) {
    throw createError(404, "Project not found :)");
  }
  return project;
};

const removeProjectHandler = async (projectId, userId) => {
  const transaction = new Transaction();
  let project = null;
  let coverPath = null;

  transaction.addStep("getUser", async () => {
    const user = await getUserById(userId);
    if (!user) throw createError(404, "User not found :)");
  });

  transaction.addStep("loadProject", async () => {
    project = await getProjectById(projectId);
    if (!project) throw createError(404, "Project not found");
    coverPath = project.cover;
  });

  transaction.addStep(
    "deleteProjectDB",
    async () => {
      await projectRepo.remove(projectId);
    },
    async () => {
      if (project) {
        const restored = await projectRepo.create({
          title: project.title,
          description: project.description,
          color: project.color,
          createdBy: project.createdBy,
          cover: project.cover,
          status: project.status,
        });
        await cacheService.set(
          `projects:${restored._id.toString()}`,
          restored,
          3600
        );
      }
    }
  );

  transaction.addStep("invalidateCache", async () => {
    await cacheService.del(`projects:${projectId}`);
  });

  transaction.addStep("deleteFiles", async () => {
    if (!coverPath) return;
    const filePath = getPublicPath(coverPath);
    await unlinkAsync(filePath);
  });

  await transaction.executeSequential();
};

const editProjectHandler = async (projectId, data, coverFile) => {
  const transaction = new Transaction();
  let project = null;
  let oldCover = null;
  let newCoverPath = null;
  let updatedProject = null

  transaction.addStep("loadProject", async () => {
    project = await projectRepo.getById(projectId);
    if (!project) throw createError(404, "Project not found");
    oldCover = project.cover;
  });

  transaction.addStep(
    "saveCover",
    async () => {
      if (coverFile) {
        newCoverPath = await saveFile(coverFile, "project-cover");
      }
    },
    async () => {
      if (newCoverPath) {
        const filePath = getPublicPath(newCoverPath);
        await unlinkAsync(filePath);
      }
    }
  );

  transaction.addStep(
    "updateProjectDB",
    async () => {
      const updateData = { ...data };
      if (newCoverPath) updateData.cover = newCoverPath;
      updatedProject = await projectRepo.updateById(projectId, updateData);
    },
    async () => {
      if (project) {
        await projectRepo.updateById(projectId, {
          title: project.title,
          description: project.description,
          color: project.color,
          status: project.status,
          cover: oldCover,
        });
      }
    }
  );

  transaction.addStep("updateCache", async () => {
    await cacheService.set(
      `projects:${projectId}`,
      updatedProject,
      60 * 60 * 24
    );
  }, async () => {
    await cacheService.set(`projects:${projectId}`, project, 60 * 60 * 24);
  });

  transaction.addStep("removeOldCover", async () => {
    if (coverFile && oldCover) {
      const filePath = getPublicPath(oldCover);
      await unlinkAsync(filePath)
    }
  });

  await transaction.executeSequential();
  return updatedProject;
};

const getProjectsHandler = async (query) => {
  const { page = 1, limit = 10, search = "", status, createdBy } = query
  const pageNum = parseInt(page, 10)
  const pageLimit = parseInt(limit, 10)
  const { projects, total } = await projectRepo.getProjects({
    page: pageNum,
    limit: pageLimit,
    search,
    status,
    createdBy
  })
  return {
    projects: projects,
    meta: {
      total,
      page: pageNum,
      limit: pageLimit,
      totalPages: Math.ceil(total / pageLimit),
    },
  }

}

const addUserToProjectHandler = async (userId, permissions, projectId) => {
  const transaction = new Transaction();
  let projectMember = null;

  transaction.addStep("checkExists", async () => {
    const [user, project] = await Promise.all([
      getUserById(userId),
      getProjectById(projectId)
    ]);

    if (!user) throw createError(404, "User not found :(");
    if (!project) throw createError(404, "Project not found :(");
  });

  transaction.addStep(
    "addUser",
    async () => {
      projectMember = await projectMemberRepo.create({ userId, projectId, permissions });
    },
    async () => {
      if (projectMember) {
        await projectMemberRepo.removeById(projectMember._id);
      }
    }
  );

  await transaction.executeSequential();
  return projectMember;
};

const removeUserFromProjectHandler = async (userId, projectId) => {
  const transaction = new Transaction();
  let projectMember = null;

  transaction.addStep("checkExists", async () => {
    const [user, project] = await Promise.all([
      getUserById(userId),
      getProjectById(projectId)
    ]);

    if (!user) throw createError(404, "User not found :(");
    if (!project) throw createError(404, "Project not found :(");

    projectMember = await projectMemberRepo.getByUserIdAndProjectId(userId, projectId);
    if (!projectMember) throw createError(404, "Project member not found :(");
  });

  transaction.addStep(
    "removeMember",
    async () => {
      await projectMemberRepo.removeById(projectMember._id);
    },
    async () => {
      await projectMemberRepo.create({
        userId,
        projectId,
        permissions: projectMember.permissions,
      });
    }
  );

  await transaction.executeSequential();

  return true;
};

const getProjectMembersHandler = async(projectId) => {
  const project = await getProjectById(projectId)
  if(!project){
    throw createError(404 , "Project not found :)")
  }
  const members = await projectMemberRepo.getMembers(projectId)
  return members
}

const getUserProjectPermissionsHandler = async(projectId , userId) => {
  const project = await getProjectById(projectId)
  if(!project) {
    throw createError(404 , "Project not found :)")
  }

  const isMemberOfProject = await projectMemberRepo.getByUserIdAndProjectId(userId , projectId)
  if(!isMemberOfProject || project._id.toString() !== isMemberOfProject._id.toString()){
    throw createError(400 , "User not member of this project :)")
  }

  return isMemberOfProject.permissions
}

module.exports = {
  createProjectHandler,
  getProjectHandler,
  removeProjectHandler,
  editProjectHandler,
  getProjectsHandler,
  addUserToProjectHandler,
  removeUserFromProjectHandler,
  getProjectMembersHandler,
  getUserProjectPermissionsHandler
};
