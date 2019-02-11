import DB from "./CRUDAction";

function subscribeToPlayersPreview(cb) {
	const getData = () => {
		DB.get("/players-preview", "")
			.then(({ error, data }) => {
				cb(error, data);
			})
			//in one second get again
			.then(() => setTimeout(getData, 2000));
	};

	getData();
}

function sendPlayersPreview(data) {
	DB.set("/players-preview", "", data);
}

export { sendPlayersPreview, subscribeToPlayersPreview };
