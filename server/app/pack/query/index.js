const Pack = require("../Pack");

async function getAllPacks(user) {
	let query;
	if (user) {
		query = Pack.find().or([{ public: true }, { _user: user }]);
	} else {
		query = Pack.find({ public: true });
	}

	//get public packs
	return await query.exec();
}

const getPackOptions = require("./getPackOptions");
const getPackByUrl = require("./getPackByUrl");
module.exports = { getAllPacks, getPackOptions, getPackByUrl };
