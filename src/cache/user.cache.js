const userRepo = require('./../modules/users/user.repo');
const {cacheService} = require('./../services/redis');
const normalizeUserData = require('./../utils/normalizeUserData');

const getUserById = async (userId) => {
    const key = `users:${userId}`
    const userRedis = await cacheService.get(key);
    if(userRedis) return userRedis
    const user = await userRepo.getById(userId)
    if(!user) return null
    const userData = normalizeUserData(user)
    await cacheService.set(key, userData, 3600);
    return userData
}

module.exports = {
    getUserById
}