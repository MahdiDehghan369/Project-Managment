const ProjectModel = require('./project.model');

class ProjectRepo {
    constructor(projectModel){
        this.ProjectModel = projectModel
    }

    async #execute(func){
        try {
            return await func()
        } catch (error) {
            throw error
        }
    }

    async create(data){
        return this.#execute(() => this.ProjectModel.create(data))
    }

    async getById(projectId){
        return this.#execute(() => this.ProjectModel.findById(projectId).populate("createdBy" ,"username fullname avatar"));
    }

    async remove(projectId){
        return this.#execute(() => this.ProjectModel.deleteOne({_id: projectId}));
    }
}

const projectRepo = new ProjectRepo(ProjectModel);
module.exports = projectRepo;