const createError = require('../../utils/createError');
const Transaction = require('./../../utils/transaction');
const userRepo = require('./../users/user.repo');
const {generateAccessToken , generateRefreshToken} = require('./../../utils/jwt');
const { sessionService } = require('../../services/redis');
const cacheUser = require('../../cache/user.cache');

const loginHandler = async (data) => {
  const { username, password } = data;
  let user = null;
  let accessToken = null;
  let refreshToken = null;
  const transaction = new Transaction();

  transaction.addStep("getUser", async () => {
    user = await userRepo.getByUsername(username);
    if (!user) throw createError(404, "Username or password is wrong :(");
  });

  transaction.addStep("verifyPassword", async () => {
    const isValid = await user.comparePassword(password);
    if (!isValid) throw createError(404, "Username or password is wrong :(");
  });

  transaction.addStep("generateAccessToken", async () => {
    accessToken = generateAccessToken(user._id.toString());
  });

  transaction.addStep("generateRefreshToken", async () => {
    refreshToken = await generateRefreshToken(user._id.toString());
  }, async () => {
    if(refreshToken){
      await sessionService.del(user._id)
    }
  });

  await transaction.executeSequential();
  return { accessToken, refreshToken };
};

const getMeHandler = async(userId) => {
  const user = await cacheUser.getUserById(userId)
  if(!user){
    throw createError(404 , "User not found :(")
  }
  return user
}

module.exports = {loginHandler, getMeHandler}