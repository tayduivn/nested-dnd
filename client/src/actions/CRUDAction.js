import React from "react";

const ErrorDisplay = ({ message }) => <div className="alert alert-danger">{message}</div>;

const HEADERS = {
	credentials: "include",
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json"
	}
};

const HEADERS_NORMAL = {
	credentials: "include",
	headers: {
		"Content-Type": "application/text",
		Accept: "application/json"
	}
};

const decoder = new TextDecoder("utf-8");

const cleanURL = url => {
	url = url.replace(/^\//, ""); // get rid of extra slash
	if (url && !url.startsWith("http")) url = URL_PREFIX + url;
	return url;
};

const URL_PREFIX = "/api/";

const fetch = global.fetch || window.fetch;

/**
 * Always returns a promise, which returns { err, data }
 */
const DB = {
	fetch: (url, method, headers, cb) => {
		headers = setHeader(method, headers);
		return fetch(cleanURL(url), headers)
			.then(r => getResponse(r, cb))
			.catch(handleError);
	},
	create: function(url, payload, abortController) {
		return this.fetch(url, "POST", { body: payload }, abortController);
	},
	get: function(url, id, abortController) {
		if (id !== undefined) return this.fetch(url + "/" + id);
		else return this.fetch(url, undefined, undefined, abortController);
	},
	getNormal: function(url, cb) {
		return this.fetch(`/normal${url}`, "GET", HEADERS_NORMAL, cb);
	},
	set: function(url, id, payload, abortController) {
		return this.fetch(url + "/" + id, "PUT", { body: payload }, abortController);
	},
	delete: function(url, id, abortController) {
		return this.fetch(url + "/" + id, "DELETE", undefined, abortController);
	}
};

function setHeader(method, headers) {
	if (!headers && !method) return HEADERS;

	if (headers) {
		if (headers.body instanceof FormData) headers.body = formDataTOJson(headers.body);
		headers.body = headers.body instanceof Object ? JSON.stringify(headers.body) : headers.body;
	}

	return Object.assign({}, HEADERS, { method: method || "GET" }, headers);
}

function formDataTOJson(formData) {
	let jsonObject = {};

	for (const [key, value] of formData.entries()) {
		jsonObject[key] = value;
	}
	return jsonObject;
}

function handleError(error) {
	// Component unmounted
	if (error.name === "AbortError") return;

	// ERR_CONNECTION_REFUSED
	if (error.message === "Failed to fetch") {
		error.message =
			"We're having trouble communicating with the server right now. Please check your internet connection.";
	}
	error.display = <ErrorDisplay {...error} />;
	return { error };
}

async function getResponse(response, cb) {
	var { data, error } = await parseResponse(response, cb);

	if (response.status === 404) {
		error = "Not found";
	}
	if (response.status !== 200) {
		if (data && data.error) {
			if (response.status === 500) {
				data.error.message = "500 Server Error: " + data.error.message;
				console.error(data.error);
			}
			error = data.error;
			delete data.error; // remove error from the return object
		} else if (!error) {
			error = { success: false };
		}
	}

	if (error) {
		if (!(error instanceof Object)) error = { value: error };
		error.display = <ErrorDisplay {...error} />;
	}

	return { error, data };
}

function decodeChunk(queue = "", value) {
	let lines = decoder.decode(value).split("\n");

	lines = lines
		.map(l => {
			try {
				l = JSON.parse(queue + l);
				queue = "";
				return l;
			} catch (e) {
				// incomplete, push it to the queue
				queue += l;
				return false;
			}
		})
		.filter(l => l);

	return { lines, queue };
}

async function parseResponse(response, cb = () => {}) {
	if (!response) return { error: "No response from server", data: {} };

	var data = {},
		error;
	var contentType = response.headers.get("content-type");

	if (contentType && contentType.includes("json")) data = await response.json();
	else {
		const reader = response.body.getReader();
		let queue = "";
		reader.read().then(function processChunk({ value, done }) {
			if (done) {
				return;
			}
			const { lines, queue: newQueue } = decodeChunk(queue, value);
			lines.forEach(cb);
			queue = newQueue;

			// do it again
			return reader.read().then(processChunk);
		});
	}
	return { data, error };
}
export default DB;
