const MW = require("./middleware.js");

module.exports = function(app,io) {

	io.on('connection', (client) => {

		client.on('setPlayersPreview', (data) => {
			console.log('client is setting players preview');
			io.sockets.emit('showPlayersPreview', data);
		});

	});
}