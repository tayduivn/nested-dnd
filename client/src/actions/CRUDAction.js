const HEADERS = {
	credentials: 'include',
	headers: {
		'Content-Type': 'application/json',
		"Accept": "application/json" 
	}
};

const URL_PREFIX = "/api/";

export default {
	create:function(url, payload, callback){
		if(payload instanceof FormData){
			payload = formDataTOJson(payload);
		}

		const headers = Object.assign({}, HEADERS,{
			method: "POST",
			body: JSON.stringify(payload)
		})

		fetch(URL_PREFIX+url, headers)
			.then(getJSONResponse)
			.then(json => {
				if(json.errors || json.error){
					return printError("",JSON.stringify(json, 2));
				}
				callback(json);
			})
	},
	getAll: function(url, callback){
		this.get(url, "", callback);
	},
	get: function(url, id, callback){
		const headers = Object.assign({}, HEADERS,{
			method: "GET"
		})

		fetch(URL_PREFIX+url+"/"+id, headers)
			.then(getJSONResponse)
			.then(json => {
				if(json.errors || json.error){
					return printError("",JSON.stringify(json, 2));
				}
				callback(json);
			})
	},
	getIn: function(child, parent, id, callback){
		this.get(child+"/"+parent+"/"+id, "", callback);
	},
	set: function(url, id, payload, callback){
		if(payload instanceof FormData){
			payload = formDataTOJson(payload);
		}

		const headers = Object.assign({}, HEADERS,{
			method: "PUT",
			body: JSON.stringify(payload)
		})

		fetch(URL_PREFIX+url+"/"+id, headers)
			.then(getJSONResponse)
			.then(json => {
				if(json.errors || json.error){
					return printError("",JSON.stringify(json, 2));
				}
				callback(json);
			})
	},
	delete: function(url, id, callback){
		const headers = Object.assign({}, HEADERS,{
			method: "DELETE"
		});

		fetch(URL_PREFIX+url+"/"+id, headers)
			.then(getJSONResponse)
			.then(json => {
				if(json.errors || json.error){
					return printError("",JSON.stringify(json, 2));
				}
				callback(json);
			})
	}
}

function printError(status, error){
	console.error(error);
	var elemDiv = document.createElement('div');
	elemDiv.innerHTML = status+": "+error; 
	window.document.body.insertBefore(elemDiv, window.document.body.firstChild);
}

function getJSONResponse(response){
	if(response.status !== 200) {
		printError(response.status," ERROR");
	}
	return response.json();
}

function formDataTOJson(formData){
	let jsonObject = {};

	for (const [key, value]  of formData.entries()) {
	    jsonObject[key] = value;
	}
	return jsonObject;
}

export {HEADERS, getJSONResponse};