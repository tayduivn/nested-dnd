const USER_NOT_LOGGED_IN = `You must be logged in to do that`;

const USER_NOT_FOUND = `User not found`;

const USER_FORBIDDEN = "You do not have permission do to that.";

const normalizeUser = user => {
	const result = {
		data: {
			type: "User",
			id: "_id",
			attributes: {}
		}
	};
	const attributes = result.data.attributes;

	if (user.local) {
		attributes.local = {
			email: user.local.email
		};
	}
	if (user.spotify) {
		attributes.spotify = {
			id: user.spotify.id
		};
	}
	return result;
};

module.exports = {
	normalizeUser,
	USER_NOT_FOUND,
	USER_NOT_LOGGED_IN,
	USER_FORBIDDEN
};
