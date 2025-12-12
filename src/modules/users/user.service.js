const createError = require("../../utils/createError");
const Transaction = require("./../../utils/transaction");
const cacheUser = require('./../../cache/user.cache');

// User Repository
const userRepo = require("./user.repo");
// Role Repository
const roleRepo = require("./../roles/role.repo");
const { cacheService, sessionService } = require("../../services/redis");

const createUserHandler = async (data) => {
  const { username, role_id } = data;
  const transaction = new Transaction();
  let user = null;

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

  transaction.addStep(
    "createUser",
    async () => {
      user = await userRepo.create(data);
    },
    async () => {
      if (user && user?._id) {
        await userRepo.remove(user._id);
      }
    }
  );
  await transaction.executeSequential();
  const userDoc = user.toObject();
  delete userDoc.password;
  return userDoc;
};

const getUsersHandler = async (query) => {
  const { page = 1, limit = 10, search = "", role } = query;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const { users, total } = await userRepo.getUsers({
    page: pageNum,
    limit: limitNum,
    search,
    role,
  });
  return {
    users: users,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

const getUserHandler = async(userId) => {
  const user = await cacheUser.getUserById(userId)
  if(!user){
    throw createError(404 , "User not found :(")
  }
  return user
}

const editUserByAdminHandler = async(userId , data) => {
  const {username , fullname} = data
  const user = await cacheUser.getUserById(userId)
  if(!user){
    throw createError(404, "User not found :(")
  }
  if(user.username == username && user.fullname == fullname){
    return user
  }
  const transaction = new Transaction()
  let updatedUser = null
  transaction.addStep("editUser" , async() => {
    updatedUser = await userRepo.updateById(userId , data) 
    await cacheService.del(`users:${userId}`);
  } , async() => {
    if(updatedUser){
      await userRepo.updateById(userId , {username: user.username, fullname: user.fullname})
      await cacheService.set(`users:${userId}`, user, 3600);
    }
  })
  await transaction.executeSequential()
  return updatedUser
}

const removeUserHandler = async (userId) => {
  const user = await cacheUser.getUserById(userId);
  if (!user) throw createError(404, "User not found :(");

  const userBackup = user;
  delete userBackup._id;  
  const refreshToken = await sessionService.get(userId);
  const transaction = new Transaction();

  transaction.addStep(
    "removeUserFromDB",
    async () => {
      await userRepo.remove(userId);
    },
    async () => {
      await userRepo.create(userBackup, { skipHashPassword : true});
      
    }
  );

  transaction.addStep(
    "removeUserFromRedis",
    async () => {
      await cacheService.del(`users:${userId}`);
      throw new Error()
    },
    async () => {
      await cacheService.set(`users:${userId}`, userBackup, 3600);
    }
  );

  transaction.addStep(
    "removeTokenFromRedis",
    async () => {
      await sessionService.del(userId);
    },
    async () => {
      if (refreshToken) {
        await sessionService.set(userId, refreshToken, 7 * 24 * 3600);
      }
    }
  );
  await transaction.executeSequential();
  return true
};


module.exports = {
  createUserHandler,
  getUsersHandler,
  getUserHandler,
  editUserByAdminHandler,
  removeUserHandler,
};
