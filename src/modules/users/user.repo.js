const UserModel = require('./user.model');
const bcrypt = require('bcrypt');

class UserRepo {
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

  async create(data, options = {}) {
    if (!options.skipHashPassword && data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return this.UserModel.create(data);
  }

  async getById(userId, options = {}) {
    let query = this.UserModel.findById(userId).populate(
      "role_id",
      "-__v -createdAt -updatedAt"
    );
    if (options.unSelect) {
      const fields = options.unSelect
        .split(" ")
        .map((field) => `-${field}`)
        .join(" ");
      query = query.select(fields);
    }

    return this.#execute(() => query);
  }

  async remove(userId) {
    return this.#execute(() => this.UserModel.deleteOne({ _id: userId }));
  }

  async getByUsername(username) {
    return this.#execute(() => this.UserModel.findOne({ username }));
  }

  async getByEmail(email) {
    return this.#execute(() => this.UserModel.findOne({ email }));
  }

  async getByPhone(phone) {
    return this.#execute(() => this.UserModel.findOne({ phone }));
  }

  async getCount(condition) {
    return this.#execute(() => this.UserModel.countDocuments(condition));
  }

  async getUsers({ page = 1, limit = 10, search = "", role }) {
    const filter = {};
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { fullname: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      filter.role_id = role;
    }

    const total = await this.UserModel.countDocuments(filter);
    const users = await this.UserModel.find(filter)
      .populate("role_id", "-__v -createdAt -updatedAt")
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-password")
      .lean();
    return { users, total };
  }

  async updateById(userId, data) {
    return this.#execute(() =>
      this.UserModel.findByIdAndUpdate(userId, data, { new: true }).select(
        "-password -__v"
      )
    );
  }
}

const userRepo = new UserRepo(UserModel)
module.exports = userRepo;
