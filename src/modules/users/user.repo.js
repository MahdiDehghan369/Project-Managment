const UserModel = require('./user.model');

class UserRepo {
  constructor(userModel) {
    this.UserModel = userModel;
  }

  async #execute(func) {
    try {
      return await func();
    } catch (error) {
        throw error
    }
  }

  async create(data){
    return this.#execute(() => this.UserModel.create(data))
  }

  async getById(userId) {
    return this.#execute(() => this.UserModel.findById(userId));
  }

  async remove(userId) {
    return this.#execute(() => this.UserModel.deleteOne({ _id: userId }));
  }

  async getByUsername(username) {
    return this.#execute(() => this.UserModel.findOne({username}))
  }

  async getCount(condition) {
    return this.#execute(() => this.UserModel.countDocuments(condition))
  }
}

const userRepo = new UserRepo(UserModel)
module.exports = userRepo;
