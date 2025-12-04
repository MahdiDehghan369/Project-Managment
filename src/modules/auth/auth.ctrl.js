const { loginHandler } = require("./auth.service");
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

module.exports = {
    login
}