const normalizaUserData = (user) => {
    const userData = {
      _id: user._id,
      username: user.username,
      fullname: user.fullname,
      role: user.role_id.name,
      role_id: user.role_id._id,
      permissions: user.role_id.permissions,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      password: user.password,
    };
    return userData
}

module.exports = normalizaUserData