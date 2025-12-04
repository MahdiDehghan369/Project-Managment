const createError = require("../../utils/createError");

// User Repository
const userRepo = require("./user.repo");

// Role Repository
const roleRepo = require("./../roles/role.repo");

const createUserHandler = async (data) => {
  const { username, role_id } = data;
  const usernameExists = await userRepo.exists({ username });
  if (usernameExists) {
    throw createError(409, "Username already exists :)");
  }
  const roleExists = await roleRepo.exists({ _id: role_id });
  if (!roleExists) throw createError(404, "Role not found :(");
  await userRepo.create(data);
  return true;
};

module.exports = {
  createUserHandler,
};
