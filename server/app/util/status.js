// started, but still processing
const ACCEPTED = 202;

// successful and no content is returned
const NO_CONTENT = 204;

const OK = 200;

const NOT_FOUND = 404;

const SERVER_ERROR = 500;

// not logged in
const UNAUTHORIZED = 401;

// your user role doesn't grant you permission to do this
const FORBIDDEN = 403;

// deletion:
// ACCEPTED, NO_CONTENT, OK, NOT_FOUND

module.exports = {
	ACCEPTED,
	NO_CONTENT,
	OK,
	NOT_FOUND,
	SERVER_ERROR,
	UNAUTHORIZED,
	FORBIDDEN
};
