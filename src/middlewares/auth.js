const createError = require("../utils/createError");
const { verifyAccessToken } = require("../utils/jwt");
const cacheUser = require('../cache/user.cache');

async function authMiddleware(req, res, next) {
  try {
    const token = req.headers["authorization"]?.replace("Bearer ", "");

    if (!token) {
      throw createError(401, "Unauthorized (Token not provided)");
    }
    let deoded = null;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      next(createError(500, "Access token expired :("));
    }
    const userId = decoded.userId;
    const userData = await cacheUser.getUserById(userId)
    req.user = userData;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authMiddleware;
