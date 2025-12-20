const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema({
    title: {
        type:String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Projects",
        required: true
    },
    deadline: {
        type: Date,
        required: false
    },
    pin: {
        type: Boolean,
        default: false
    },
    status: {
        type: String
    }
} , {
    timestamps: true
})

const taskModel = mongoose.model("tasks" , taskSchema)

module.exports = taskModel