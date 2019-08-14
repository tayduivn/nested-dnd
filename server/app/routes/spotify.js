const router = require("express").Router();
const request = require("request");
const { isLoggedIn } = require("./middleware.js");
const { AUTH, BASE_URL, REFRESH_URL, getExpiration } = require("../util/spotify");

/**
 * Middleware:
 * if the spotify token is expired, refresh it.
 */
router.use((req, res, next) => {
	const { expires, refreshToken } = req.user.spotify;
	const expired = expires < new Date();

	if (!expired) return next();

	request.post(
		REFRESH_URL,
		{
			headers: {
				Authorization: AUTH
			},
			form: {
				grant_type: "refresh_token",
				refresh_token: refreshToken
			}
		},
		(error, response, body) => {
			if (error) return next(error);

			req.user.set("spotify.accessToken", body.access_token);
			req.user.set("spootify.expires", getExpiration(body.expires_in));

			next();
		}
	);
});

router.get("/playlists", isLoggedIn, (req, res) => {
	console.log("Requesting", `${BASE_URL}/users/${req.user.spotify.id}/playlists`);
	request.get(
		`${BASE_URL}/users/${req.user.spotify.id}/playlists`,
		{
			headers: {
				Authorization: `Bearer ${req.user.spotify.accessToken}`
			},
			json: true
		},
		(error, response, body) => {
			res.json(body);
		}
	);
});

module.exports = router;
