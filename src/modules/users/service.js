const User = require("./model");

exports.getUsers = async (query) => {
  // -> add pagination
  const { page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  // -> filter by gender
  const filter = {};
  const { gender } = query;
  if (gender) filter.gender = gender;

  // -> implement other business logics if any

  return User.find(filter)
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .sort({ name: 1 })
    .exec();
};

exports.createUser = (userData) => {
  // -> implement business logics if any
  return User.create(userData);
};

exports.updateUser = async (data, filter) => {
  const result = await User.findOneAndUpdate(filter.where, data, {
    new: true,
    runValidators: true,
  });
  return result;
};

// < define other services like delete, etc >

