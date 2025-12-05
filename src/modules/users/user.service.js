const createError = require("../../utils/createError");
const Transaction = require("./../../utils/transaction");

// User Repository
const userRepo = require("./user.repo");
// Role Repository
const roleRepo = require("./../roles/role.repo");

const createUserHandler = async (data) => {
  const { username, role_id } = data;
  const transaction = new Transaction();
  let user = null

  transaction.addStep("checkUsername", async () => {
    const usernameExists = await userRepo.getByUsername(username);
    if (usernameExists) {
      throw createError(409, "Username already exists :)");
    }
  });

  transaction.addStep("checkRole", async () => {
    const roleExists = await roleRepo.getById(role_id);
    if (!roleExists) throw createError(404, "Role not found :(");
  });

  transaction.addStep("createUser" , async() => {
    user = await userRepo.create(data)
  } , async() => {
    if(user && user?._id){
      await userRepo.remove(user._id)
    }
  })
  await transaction.executeSequential();
  const userDoc = user.toObject();
  delete userDoc.password;
  return userDoc;
};

module.exports = {
  createUserHandler,
};
