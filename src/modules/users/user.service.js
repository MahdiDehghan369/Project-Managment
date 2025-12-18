const createError = require("../../utils/createError");
const Transaction = require("./../../utils/transaction");
const cacheUser = require("./../../cache/user.cache");
const getPublicPath = require("./../../utils/getPublicPath");

// User Repository
const userRepo = require("./user.repo");
// Role Repository
const roleRepo = require("./../roles/role.repo");
const { cacheService, sessionService } = require("../../services/redis");
const { unlinkAsync } = require("../../utils/asyncFs");
const { saveFile } = require("../../middlewares/imageUploader");
const normalizaUserData = require("../../utils/normalizeUserData");

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

const getUserHandler = async (userId) => {
  const user = await cacheUser.getUserById(userId);
  if (!user) {
    throw createError(404, "User not found :(");
  }
  return user;
};

const editUserByAdminHandler = async (userId, data) => {
  const { username, fullname } = data;
  const user = await cacheUser.getUserById(userId);
  if (!user) {
    throw createError(404, "User not found :(");
  }
  if (user.username == username && user.fullname == fullname) {
    return user;
  }
  const transaction = new Transaction();
  let updatedUser = null;
  transaction.addStep(
    "editUser",
    async () => {
      updatedUser = await userRepo.updateById(userId, data);
      await cacheService.del(`users:${userId}`);
    },
    async () => {
      if (updatedUser) {
        await userRepo.updateById(userId, {
          username: user.username,
          fullname: user.fullname,
        });
        await cacheService.set(`users:${userId}`, user, 3600);
      }
    }
  );
  await transaction.executeSequential();
  return updatedUser;
};

const editUserHandler = async (userId, data, avatarFile) => {
  const { email, phone } = data;
  const user = await userRepo.getById(userId);
  if (!user) throw createError(404, "User not found :)");

  const updatePayload = {};
  let avatarPath;

  const tx = new Transaction();
  tx.addStep("validate-email", async () => {
    if (!email || email === user.email) return;
    const exists = await userRepo.getByEmail(email);
    if (exists && exists._id.toString() !== userId.toString()) {
      throw createError(409, "Email already exists :)");
    }
  });

  tx.addStep("validate-phone", async () => {
    if (!phone || phone === user.phone) return;
    const exists = await userRepo.getByPhone(phone);
    if (exists && exists._id.toString() !== userId.toString()) {
      throw createError(409, "Phone number already exists :)");
    }
  });

  await tx.executeParallel();

  const sequentialTransaction = new Transaction();
  let newUserInfo = null;

  sequentialTransaction.addStep(
    "build-payload",
    async () => {
      if (email && email !== user.email) updatePayload.email = email;
      if (phone && phone !== user.phone) updatePayload.phone = phone;
      if (avatarFile) {
        avatarPath = await saveFile(avatarFile, "avatar");
        await userRepo.updateById(userId, { avatar: avatarPath });
      }
    },
    async () => {
      if (avatarPath) {
        const newAvatarPath = getPublicPath(avatarPath);
        await unlinkAsync(newAvatarPath);
      }
    }
  );

  sequentialTransaction.addStep(
    "update-user",
    async () => {
      if (!Object.keys(updatePayload).length) return;
      await userRepo.updateById(userId, updatePayload);
    },
    async () => {
      await userRepo.updateById(userId, {
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
      });

      if (avatarPath) {
        const newAvatarPath = getPublicPath(avatarPath);
        await unlinkAsync(newAvatarPath);
      }
    }
  );

  sequentialTransaction.addStep("get-user", async () => {
    newUserInfo = await userRepo.getById(userId);
  });

  sequentialTransaction.addStep(
    "update-user-cache",
    async () => {
      await cacheService.set(
        `users:${userId}`,
        normalizaUserData(newUserInfo),
        3600
      );
    },
    async () => {
      await cacheService.set(`users:${userId}`, normalizaUserData(user), 3600);
    }
  );

  await sequentialTransaction.executeSequential();

  if (avatarPath && user.avatar) {
    const oldAvatarPath = getPublicPath(user.avatar);
    await unlinkAsync(oldAvatarPath);
  }

  return newUserInfo;
};

const removeUserHandler = async (userId) => {
  const user = await cacheUser.getUserById(userId);
  if (!user) throw createError(404, "User not found :(");

  const userBackup = user;
  delete userBackup._id;
  const refreshToken = await sessionService.get(userId);
  const transaction = new Transaction();

  transaction.addStep(
    "removeUserFromRedis",
    async () => {
      await cacheService.del(`users:${userId}`);
    }
  );

  transaction.addStep(
    "removeTokenFromRedis",
    async () => {
      await sessionService.del(userId);
    }
  );

  transaction.addStep(
    "removeUserFromDB",
    async () => {
      await userRepo.remove(userId);
    },
    async () => {
      await userRepo.create(userBackup, { skipHashPassword: true });
    }
  );

  transaction.addStep("removeAvatar", async () => {
    if (!user.avatar) return;
    const filePath = getPublicPath(user.avatar);
    await unlinkAsync(filePath);
  });

  await transaction.executeSequential();
  return true;
};

const assignRoleHandler = async (userId, roleId) => {
  const transaction = new Transaction();
  let role, user;
  transaction.addStep("getRole", async () => {
    role = await roleRepo.getById(roleId);
    if (!role) {
      throw createError(404, "Role not found :(");
    }
  });
  transaction.addStep("getUser", async () => {
    user = await cacheService.get(`users:${userId}`);
    if (!user) {
      user = await userRepo.getById(userId);
      if (!user) {
        throw createError(404, "User not found :(");
      }
      await cacheService.set(`users:${userId}`, normalizaUserData(user), 3600);
    }
  });

  await transaction.executeParallel();

  let newUser = null;
  if (user.role_id.toString() !== roleId.toString()) {
    newUser = await userRepo.updateById(userId, { role_id: roleId });
    await cacheService.set(`users:${userId}`, normalizaUserData(newUser), 3600);
  }
  const userData = newUser ? normalizaUserData(newUser) : null;
  return userData ?? user;
};

module.exports = {
  createUserHandler,
  getUsersHandler,
  getUserHandler,
  editUserByAdminHandler,
  editUserHandler,
  removeUserHandler,
  assignRoleHandler,
};
