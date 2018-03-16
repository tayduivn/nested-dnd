const HEADERS = {
	credentials: 'include',
	headers: {
		'Content-Type': 'application/json',
		"Accept": "application/json" 
	}
};

const URL_PREFIX = "/api/";

export default {
	create: async function(url, payload, callback){
		if(payload instanceof FormData){
			payload = formDataTOJson(payload);
		}

		const headers = Object.assign({}, HEADERS,{
			method: "POST",
			body: JSON.stringify(payload)
		})

		var response = await fetch(URL_PREFIX+url, headers)
		var json = await response.json();
		handleErrors(response, json);

		if(callback) return callback(json);
		return json;
	},
	getAll: function(url, callback){
		this.get(url, "", callback);
	},
	get: async function(url, id, callback){
		const headers = Object.assign({}, HEADERS,{
			method: "GET"
		})

		var response = await fetch(URL_PREFIX+url+"/"+id, headers)
		var json = await response.json();
		handleErrors(response, json);

		if(callback) return callback(json);
		return json;
	},
	getIn: function(child, parent, id, callback){
		return this.get(parent+"/"+id+"/"+child, "", callback);
	},
	set: async function(url, id, payload, callback){
		if(payload instanceof FormData){
			payload = formDataTOJson(payload);
		}

		const headers = Object.assign({}, HEADERS,{
			method: "PUT",
			body: JSON.stringify(payload)
		})

		var response = await fetch(URL_PREFIX+url+"/"+id, headers)
		var json = await response.json();
		handleErrors(response, json);

		//.then(json => {
		if(callback) return callback(json);
		return json;
		// }).catch(ajaxError);8/
	},
	delete: async function(url, id, callback){
		const headers = Object.assign({}, HEADERS,{
			method: "DELETE"
		});

		var response = await fetch(URL_PREFIX+url+"/"+id, headers);
		var json = response.json();
		handleErrors(response,json);

		if(callback) callback(json);
		return json;
	}
}

function handleErrors(response, json){

	if(response.status !== 200 || json.errors || json.error) {
		console.error(response.statusText+": "+response.status+" ERROR from "+response.url)
		console.error(json);
		var err = new Error(response.statusText+": "+response.status+" ERROR ", response.url);
		throw err;
	}
}

function printError(status, error){
	console.error(error);
	var elemDiv = document.createElement('div');
	elemDiv.innerHTML = status+": "+error; 
	window.document.body.insertBefore(elemDiv, window.document.body.firstChild);
}

function formDataTOJson(formData){
	let jsonObject = {};

	for (const [key, value]  of formData.entries()) {
	    jsonObject[key] = value;
	}
	return jsonObject;
}

export {HEADERS};