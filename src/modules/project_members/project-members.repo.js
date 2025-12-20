const projectMemberModel = require("./project-members.model")

class ProjectMemberRepo {
    constructor(projectMemberModel){
        this.ProjectMemberModel = projectMemberModel
    }

    async #execute(func){
        try {
            return await func()
        } catch (error) {
            throw error
        }
    }

    async create(data){
        return this.#execute(() => this.ProjectMemberModel.create(data))
    }

    async removeById(id){
        return this.#execute(() => this.ProjectMemberModel.deleteOne({_id: id}))
    }

    async getByUserIdAndProjectId(userId , projectId){
        return this.#execute(() => this.ProjectMemberModel.findOne({userId , projectId}))
    }

    async getMembers(projectId){
        return this.#execute(() => this.ProjectMemberModel.find({projectId}))
    }
}

const projectMemberRepo = new ProjectMemberRepo(projectMemberModel)

module.exports = projectMemberRepo