const mongoose = require("mongoose")

const projectMembersSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Projects",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    permissions: {
      type: [String],
      default: [],
    },
})

const projectMemberModel = mongoose.model("Project-Members" , projectMembersSchema)

module.exports = projectMemberModel