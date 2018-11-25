import DB from './CRUDAction';

function subscribeToPlayersPreview(cb){
	console.log("subscribeToPlayersPreview");

	const getData = () => {
		DB.get('/players-preview','')
			.then( ({ error, data }) => {
				cb(error, data);
			})
			//in one second get again
			.then(() => setTimeout(getData, 2000))
	}

	getData();
}



function sendPlayersPreview(data){
	console.log("sendPlayersPreview");
	DB.set('/players-preview', '', data);
}

export { sendPlayersPreview, subscribeToPlayersPreview }