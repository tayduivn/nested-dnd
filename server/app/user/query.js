const debug = require("debug")("app:user:query");
const User = require("./User");

const getUser = async id => {
	debug("STARTED  User.findById --- getUser");
	const user = await User.findById(id).exec();
	debug("   DONE  User.findById --- getUser");
	return user;
};

// we can't delete all of their stuff in one call. In order to do that, you need the aggregation
// framework, which can't do multiple data manipulations
const deleteUser = async id => {
	debug("STARTED  User.findByIdAndDelete --- deleteUser");
	const result = await User.findByIdAndDelete(id).exec();
	debug("   DONE  User.findById --- getUser");
	return result;
};

module.exports = {
	deleteUser,
	getUser
};
