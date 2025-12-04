const createError = require('../../utils/createError');
const userRepo = require('./../users/user.repo');
const {generateAccessToken , generateRefreshToken} = require('./../../utils/jwt');

const loginHandler = async (data) => {
    const {username , password} = data;
    const user = await userRepo.getByUsername(username)
    if (!user || !(await user.comparePassword(password))) {
      throw createError(404, "Username or password is wrong :(");
    }

    const accessToken = generateAccessToken(user._id.toString())    
    const refreshToken = await generateRefreshToken(user._id.toString())
    
    return {accessToken , refreshToken}
};

module.exports = {loginHandler}