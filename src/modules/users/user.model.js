const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      minlength: 3,
      maxlength: 60,
      required: true,
    },
    username: {
      type: String,
      minlength: 3,
      maxlength: 60,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      minlength: 3,
      maxlength: 120,
      unique: true,
      sparse: true,
    },
    phone: {
      type: String,
      min: 11,
      max: 11,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: false,
    },
    role_id: {
      type: mongoose.Types.ObjectId,
      ref: "Roles",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// userSchema.pre("save", async function () {
//   try {
//     if (!this.isModified("password")) return;
//     this.password = await bcrypt.hash(this.password, 10);
//   } catch (error) {
//     throw error
//   }
// });

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.index({ username: 1 }, { unique: true });

const userModel = mongoose.model("Users" , userSchema)
module.exports = userModel 