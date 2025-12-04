const userRepo = require("../modules/users/user.repo");
const roleRepo = require("../modules/roles/role.repo");
const createError = require("../utils/createError");
const { verifyAccessToken } = require("../utils/jwt");
const { cacheService } = require("../services/redis");

async function authMiddleware(req, res, next) {
  try {
    const token = req.headers["authorization"]?.replace("Bearer ", "");

    if (!token) {
      throw createError(401, "Unauthorized (Token not provided)");
    }
    const decoded = verifyAccessToken(token);
    const userId = decoded.userId;
    let user = await cacheService.get(userId);
    if (!user) {
      const dbUser = await userRepo.getById(userId);
      if (!dbUser) throw createError(404, "User not found");

      const role = await roleRepo.getById(dbUser.role_id);
      if (!role) throw createError(404, "Role not found");

      user = {
        id: dbUser._id,
        fullname: dbUser.fullname,
        username: dbUser.username,
        role: role.name,
        permissions: role.permissions,
      };
      await cacheService.set(userId, user, 3600);
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authMiddleware;
