const UserModel = require("./../users/user.model");

class AuthRepo {
  constructor(userModel) {
    this.UserModel = userModel;
  }

  async #execute(func) {
    try {
      return await func();
    } catch (error) {
      throw error;
    }
  }

  async getById(userId) {
    return this.#execute(() => this.UserModel.findById(userId));
  }

  async exists(condition) {
    return this.#execute(async () => {
      const count = await this.UserModel.countDocuments(condition);
      return count > 0;
    });
  }
}

const authRepo = new AuthRepo(UserModel);
module.exports = authRepo;
