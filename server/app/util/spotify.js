const BASE_URL = "https://api.spotify.com/v1";
const REFRESH_URL = "https://accounts.spotify.com/api/token";
const SCOPE = [
	"user-read-email",
	"user-read-playback-state",
	"user-read-currently-playing",
	"user-modify-playback-state",
	"playlist-read-collaborative",
	"streaming",
	"playlist-read-private"
];

const encodedId = Buffer.from(
	`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
).toString("base64");

const AUTH = `Basic ${encodedId}`;

function getExpiration(seconds) {
	const d = new Date();
	return d.setSeconds(d.getSeconds() + seconds);
}

module.exports = {
	AUTH,
	REFRESH_URL,
	BASE_URL,
	SCOPE,
	getExpiration
};
