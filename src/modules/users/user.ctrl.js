const { createUserHandler } = require("./user.service");
const {successResponse} = require('./../../utils/response');

const createUser = async (req, res, next) => {
    try {
        const data = req.body
        const result = await createUserHandler(data)
        return successResponse(res, 201 , "User created successfully :)" , result)
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createUser
}