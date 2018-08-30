import io from "socket.io-client";

// console.log("Start socket.io connection")
// const socket = io();

function subscribeToPlayersPreview(cb){
	/*console.log("subscribeToPlayersPreview");
	socket.on('showPlayersPreview', data => {
  	cb(null, data)
  });*/
}

function sendPlayersPreview(data){
	/*console.log("sendPlayersPreview");
	socket.emit('setPlayersPreview', data);*/
}

export { sendPlayersPreview, subscribeToPlayersPreview }