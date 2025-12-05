const { loginHandler, getMeHandler, refreshTokenHandler, logoutHandler } = require("./auth.service");
const { successResponse } = require("./../../utils/response");

const login = async (req, res, next) => {
  try {
    const data = req.body;
    const { accessToken, refreshToken } = await loginHandler(data);
    res.cookie("RefreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return successResponse(res, 200, "User logged in successfully :)" , {accessToken});
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const userId = req.user._id
    const user = await getMeHandler(userId)
    return successResponse(res , 200 , "Fetched user successfully :)" , {user})
  } catch (error) {
    next(error)
  }
}

const refreshToken = async (req, res, next) => {
  try {
    const userId = req.user._id
    const token = req.cookies.RefreshToken
    const accessToken = await refreshTokenHandler(userId , token)
    return successResponse(res, 200 , "Token refreshed successfully :)" , {accessToken})
  } catch (error) {
    next(error)
  }
}

const logout = async (req, res, next) => {
  try {
    const userId = req.user._id
    await logoutHandler(userId)
    res.clearCookie("RefreshToken")
    return successResponse(res, 200 , "Logout successfully :)")
  } catch (error) {
    next(error)
  }
}

module.exports = {
  login,
  getMe,
  refreshToken,
  logout,
};