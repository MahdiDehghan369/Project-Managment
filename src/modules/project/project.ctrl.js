const { successResponse } = require("../../utils/response");
const {
  createProjectHandler,
  getProjectHandler,
  removeProjectHandler,
  editProjectHandler,
  getProjectsHandler,
  addUserToProjectHandler,
  removeUserFromProjectHandler,
  getProjectMembersHandler,
  getUserProjectPermissionsHandler,
} = require("./project.service");

const createProject = async (req, res, next) => {
  try {
    const data = req.body;
    const userId = req.user._id;
    const result = await createProjectHandler(userId, data, req.file);
    return successResponse(res, 201, "Project created successfully :)", {
      project: result,
    });
  } catch (error) {
    next(error);
  }
};

const getProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const result = await getProjectHandler(projectId);
    return successResponse(res, 200, "Fetch project successfully :)", {
      project: result,
    });
  } catch (error) {
    next(error);
  }
};

const removeProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;
    await removeProjectHandler(projectId, userId);
    return successResponse(res, 200, "Project removed successfully");
  } catch (error) {
    next(error);
  }
};

const editProject = async (req, res, next) => {
  try {
    const {projectId} = req.params
    const data = req.body
    const coverFile = req.file
    const result = await editProjectHandler(projectId , data , coverFile)
    return successResponse(res, 200 , "Project updated successfully :)" , {
      project: result
    })
  } catch (error) {
    next(error)
  }
}

const getProjects = async (req, res, next) => {
  try {
    const query = req.query
    const result = await getProjectsHandler(query)
    return successResponse(res, 200 , "Fetch projects successfully :)" , result)
  } catch (error) {
    next(error)
  }
}

const addUserToProject = async(req, res, next) => {
  try {
    const {userId , permissions} = req.body
    const {projectId} = req.params
    const result = await addUserToProjectHandler(userId , permissions , projectId)
    return successResponse(res, 201 , "User added to project successfully :)" , {
      member: result
    })
  } catch (error) {
    next(error)
  }
}

const removeUserFromProject = async(req, res, next) => {
  try {
    const {projectId , userId} = req.params
    await removeUserFromProjectHandler(userId, projectId)
    return successResponse(res, 200 , "User removed from project successfully :)")
  } catch (error) {
    next(error)
  }
}

const getProjectMembers = async(req, res, next) => {
  try {
    const {projectId} = req.params
    const result = await getProjectMembersHandler(projectId)
    return successResponse(res, 200 , "Fetch project members successfully :)" , {
      members: result
    })
  } catch (error) { 
    next(error)
  }
}

const getUserProjectPermissions = async(req, res, next) => {
  try {
    const {projectId , userId} = req.params
    const result = await getUserProjectPermissionsHandler(projectId,  userId)
    return successResponse(res, 200 , "Fetch user project permissions successfully :)" , {
      permissions: result
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createProject,
  getProject,
  removeProject,
  editProject,
  getProjects,
  addUserToProject,
  removeUserFromProject,
  getProjectMembers,
  getUserProjectPermissions
};