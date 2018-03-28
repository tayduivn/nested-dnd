import React from 'react';

const ErrorDisplay = ({message}) => (
	<div className="alert alert-danger">
		{message}
	</div>
);

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
const DB = {
	fetch: (url, method, headers)=>{
		headers = setHeader(method, headers);
		url = url.replace(/^\//, ''); // get rid of extra slash
		return fetch(URL_PREFIX+url, headers).then(getResponse).catch(handleError);
	},
	create: function(url, payload){
		return this.fetch(url, "POST", {body: payload});
	},
	get: function(url, id){
		if(id !== undefined) return this.fetch(url+"/"+id)
		else return this.fetch(url)
	},
	set: function(url, id, payload){
		return this.fetch(url+"/"+id, "PUT",{body: payload});
	},
	delete: function(url, id){
		return this.fetch(url+"/"+id, "DELETE");
	}
}


function setHeader(method, headers){
	if(!headers && !method) return HEADERS;

	if(headers){
		if(headers.body instanceof FormData) 
			headers.body = formDataTOJson(headers.body);
		headers.body = (headers.body instanceof Object) ? JSON.stringify(headers.body) : headers.body;
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

function handleError(error){
	// ERR_CONNECTION_REFUSED
	if(error.message === "Failed to fetch"){
		error.message = "We're having trouble communicating with the server right now. Please check your internet connection."
	}
	error.display = <ErrorDisplay {...error} />
	return { error }
}

async function getResponse(response){

	var { data, error } = await parseResponse(response);

	if(response.status === 404){
		error = "Not found";
	}
	if(response.status !== 200) {
		if(data && data.error){
			if(response.status === 500){
				data.error.message = "500 Server Error: "+data.error.message
				console.error(data.error);
			}
			error = data.error;
			delete data.error; // remove error from the return object
		}
		else if(!error){
			error = true;
		}
	}

	if(error) error.display = <ErrorDisplay {...error} />

	return { error, data }
}

async function parseResponse(response){
	if(!response) return { error: "No response from server", data: {} }

	var data = {}, error;
	var contentType = response.headers.get("content-type");

	if(contentType && contentType.includes("json"))
		data = await response.json()
	else{
		error = {
			message: await response.text()
		}
	}
	return { data, error };
}
export default DB;