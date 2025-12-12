const roleRepo = require('./../modules/roles/role.repo');

const roles = [
  {
    name: "super_admin",
    permissions: ["*"],
  },
];

async function seedRoles() {
  try {
    for (const role of roles) {
      const exists = await roleRepo.getByName(role.name);

      if (!exists) {
        await roleRepo.create(role);
        console.log(`Role created: ${role.name}`);
      } else {
        console.log(`Role already exists: ${role.name}`);
      }
    }
  } catch (err) {
    throw err
  }
}

module.exports = seedRoles;
