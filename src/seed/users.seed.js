const roleRepo = require("../modules/roles/role.repo");
const createError = require("../utils/createError");
const userRepo = require("./../modules/users/user.repo");

const users = [
  {
    fullname: "مهدی دهقان اسدآبادی",
    username: "mahdi.dehghanasadabdi",
    password: "326159487",
  },
];

async function seedUsers() {
  try {
    for (const user of users) {
      const exists = await userRepo.getByUsername(user.username);
      if (!exists) {
        const role = await roleRepo.getByName("super_admin");
        if (!role) throw createError(404, "Role(super_admin) not found :(");
        user.role_id = role._id;
        await userRepo.create(user);
        console.log(`user created: ${user.username}`);
      } else {
        console.log(`user already exists: ${user.username}`);
      }
    }
  } catch (err) {
    throw err;
  }
}

module.exports = seedUsers;
