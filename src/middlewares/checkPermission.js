const createError = require("../utils/createError");

const checkPermission = (...requiredPermissions) => {
  return (req, res, next) => {
    const userPermissions = req.user?.permissions || [];

    if (userPermissions.includes("*")) {
      return next();
    }

    const hasPermission = requiredPermissions.some((p) =>
      userPermissions.includes(p)
    );

    if (!hasPermission) {
      throw createError(
        403,
        "You don't have permission to perform this action"
      );
    }
    next();
  };
};

module.exports = checkPermission;
