const ProjectModel = require('./project.model');

class ProjectRepo {
    constructor(projectModel) {
        this.ProjectModel = projectModel
    }

    async #execute(func) {
        try {
            return await func()
        } catch (error) {
            throw error
        }
    }

    async create(data) {
        return this.#execute(() => this.ProjectModel.create(data))
    }

    async getById(projectId) {
        return this.#execute(() => this.ProjectModel.findById(projectId).populate("createdBy", "username fullname avatar"));
    }

    async remove(projectId) {
        return this.#execute(() => this.ProjectModel.deleteOne({ _id: projectId }));
    }

    async updateById(projectId, data) {
        return this.#execute(() =>
            this.ProjectModel.findByIdAndUpdate(projectId, data, { new: true })
                .populate("createdBy", "username fullname avatar")
                .select("-__v")
        );
    }

    async getProjects({ page = 1, limit = 10, search = "", createdBy , status }) {
        const filter = {};
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        if (createdBy) {
            filter.createdBy = createdBy;
        }

        if(status){
            filter.status = status
        }

        const total = await this.ProjectModel.countDocuments(filter);
        const projects = await this.ProjectModel.find(filter)
            .populate("createdBy").select("username", "fullname", "email", "_id", "avatar")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();
        return { projects, total };
    }
}

const projectRepo = new ProjectRepo(ProjectModel);
module.exports = projectRepo;