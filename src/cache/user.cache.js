const roleRepo = require('../modules/roles/role.repo');
const userRepo = require('./../modules/users/user.repo');
const {cacheService} = require('./../services/redis');

const getUserById = async (userId) => {
    const key = `users:${userId}`
    const userRedis = await cacheService.get(key);
    if(userRedis) return userRedis
    const user = await userRepo.getById(userId)
    if(!user) return null
    const userData = {
      _id: user._id,
      username: user.username,
      fullname: user.fullname,
      role: user.role_id.name,
      role_id:user.role_id._id,
      permissions: user.role_id.permissions,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      password: user.password
    };
    await cacheService.set(key, userData, 3600);
    return userData
}

module.exports = {
    getUserById
}