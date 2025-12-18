const { successResponse } = require("../../utils/response")
const { createProjectHandler, getProjectHandler } = require("./project.service")

const createProject = async (req, res, next) => {
    try {
        const data = req.body
        const userId = req.user._id
        const result = await createProjectHandler(userId, data, req.file)
        return successResponse(res , 201 , "Project created successfully :)" , {project: result})
    } catch (error) {
        next(error)
    }
}

const getProject = async(req, res, next) => {
    try {
    const { projectId } = req.params;
    const result = await getProjectHandler(projectId);
    return successResponse(res, 200, "Fetch project successfully :)", {
      project: result,
    });    
    } catch (error) {
        next(error)
    }
}

module.exports = {
  createProject,
  getProject,
};