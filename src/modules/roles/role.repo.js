const RoleModel = require('./role.model');

class RoleRepo {
  constructor(roleModel) {
    this.RoleModel = roleModel;
  }

  async #execute(func) {
    try {
      return await func();
    } catch (error) {
      throw error;
    }
  }

  async create(data) {
    return await this.#execute(() => this.RoleModel.create(data));
  }

  async getByName(name) {
    return await this.#execute(() => this.RoleModel.findOne({name}));
  }

  async exists(condition) {
    return await this.#execute(() => this.RoleModel.findOne(condition));
  }
}

const roleRepo = new RoleRepo(RoleModel) 
module.exports = roleRepo