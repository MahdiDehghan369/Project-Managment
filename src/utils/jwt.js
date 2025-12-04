const jwt = require("jsonwebtoken");
const env = require("./env");
const {sessionService} = require('./../services/redis');

// -------------------- Generate Access Token --------------------
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    env.JWT.SECRET_KEY_ACCESS_TOKEN,
    { expiresIn: env.JWT.ACCESS_TOKEN_EXPIRE || "15m" }
  );
};

// -------------------- Generate Refresh Token --------------------
const generateRefreshToken = async (userId) => {
  const ttl = 7 * 24 * 3600;
  const userHasToken = await sessionService.get(userId);

  if (userHasToken) {
    await sessionService.set(userId, userHasToken, ttl);
    return userHasToken;
  }

  const token = jwt.sign({ userId }, env.JWT.SECRET_KEY_REFRESH_TOKEN, {
    expiresIn: env.JWT.REFRESH_TOKEN_EXPIRE || "7d",
  });

  await sessionService.set(userId, token, ttl);
  return token;
};


// -------------------- Verify Access Token --------------------
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.JWT.SECRET_KEY_ACCESS_TOKEN);
  } catch (error) {
    throw error;
  }
};

// -------------------- Verify Refresh Token --------------------
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, env.JWT.SECRET_KEY_REFRESH_TOKEN);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
