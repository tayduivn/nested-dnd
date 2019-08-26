const Table = require("../table/Table");

const deleteTablesByUser = async id => {
	await Table.deleteMany({ user_id: id }).exec();
};

module.exports = {
	deleteTablesByUser
};
