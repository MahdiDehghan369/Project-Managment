const { createUserHandler, getUsersHandler, getUserHandler, editUserByAdminHandler, removeUserHandler } = require("./user.service");
const {successResponse} = require('./../../utils/response');
const createError = require("../../utils/createError");

const createUser = async (req, res, next) => {
    try {
        const data = req.body
        const result = await createUserHandler(data)
        return successResponse(res, 201 , "User created successfully :)" , result)
    } catch (error) {
        next(error)
    }
}

const getUsers = async (req, res, next) => {
    try {
        const query = req.query
        const result = await getUsersHandler(query)
        return successResponse(res, 200 , "Fetched all users successfully :)" , result)
    } catch (error) {
        next(error)
    }
}

const getUser = async (req, res, next) => {
    try {
        const {userId} = req.params
        const user = await getUserHandler(userId)
        return successResponse(res , 200 , "Fetched user successfully :)" , {user})
    } catch (error) {
        next(error)
    }
}

const editUserByAdmin = async(req, res, next) => {
    try {
        const {userId} = req.params
        const data = req.body
        const user = await editUserByAdminHandler(userId , data)
        return successResponse(res, 200 , "User updated successfully :)" , {user})
    } catch (error) {
        next(error)
    }
}

const removeUser = async(req, res, next) => {
    try {
        const {userId} = req.params
        const myId = req.user._id.toString()
        if(userId === myId){
            throw createError(400 , "You can not remove yourself :)")
        }
        await removeUserHandler(userId)
        return successResponse(res, 204 , "User removed successfully :)")
    } catch (error) {
        next(error)
    }
}

module.exports = {
  createUser,
  getUsers,
  getUser,
  editUserByAdmin,
  removeUser,
};