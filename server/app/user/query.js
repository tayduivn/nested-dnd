const User = require("./User");

const getUser = async id => {
	return await User.findById(id).exec();
};

// we can't delete all of their stuff in one call. In order to do that, you need the aggregation
// framework, which can't do multiple data manipulations
const deleteUser = async id => {
	return await User.findByIdAndDelete(id).exec();
};

module.exports = {
	deleteUser,
	getUser
};
