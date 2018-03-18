
const HEADERS = {
	credentials: 'include',
	headers: {
		'Content-Type': 'application/json',
		"Accept": "application/json" 
	}
};

const URL_PREFIX = "/api/";

/**
 * Always returns a promise, which returns { err, data }
 */
var DB = {
	fetch: (url, method, headers)=>{
		headers = setHeader(method, headers);
		url = url.replace(/^\//, ''); // get rid of extra slash
		return fetch(URL_PREFIX+url, headers).then(getResponse);
	},
	create: function(url, payload){
		return this.fetch(url, "POST", {body: payload});
	},
	get: function(url, id){
		return this.fetch(url+"/"+id)
	},
	set: function(url, id, payload){
		return this.fetch(url+"/"+id, "PUT",{body: payload});
	},
	delete: function(url, id){
		return this.fetch(url+"/"+id, "DELETE");
	}
}

/*
function printError(status, error){
	console.error(error);
	var elemDiv = document.createElement('div');
	elemDiv.innerHTML = status+": "+error; 
	window.document.body.insertBefore(elemDiv, window.document.body.firstChild);
}*/

function setHeader(method, headers){
	if(!headers && !method) return HEADERS;

	if(headers){
		if(headers.body instanceof FormData){
			headers.body = formDataTOJson(headers.body);
		}
		if(headers.body instanceof Object){ // no else!
			headers.body = JSON.stringify(headers.body);
		}
	}

	return Object.assign({}, HEADERS, {method: method || "GET"}, headers);
}

function formDataTOJson(formData){
	let jsonObject = {};

	for (const [key, value]  of formData.entries()) {
	    jsonObject[key] = value;
	}
	return jsonObject;
}

async function getResponse(response){

	if(!response){
		return { error: "No response from server" }
	}

	var data, error, contentType = response.headers.get("content-type");

	if(contentType && contentType.includes("json"))
		data = await response.json()
	else{
		data = await response.text();
	}

	if(response.status === 404){
		error = "Not found";
	}
	if(response.status !== 200) {
		if(data.error){
			if(response.status === 500)
				console.error(data.error);
			console.log(data.error); 
			error = data.error;
			delete data.error; // remove error from the return object
		}
		else if(!error){
			error = true;
		}
	}

	return { error, data }
}

export default DB;