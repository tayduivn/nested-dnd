const Pack = require("../Pack");

// this should be basic data -- example usage: Edit Pack, where you're just editing the
// name and url and stuff
module.exports = async function getPackByUrl(url, user_id) {
	const pack = await Pack.findOne({ url: url, _user: user_id });
	return pack;
};
