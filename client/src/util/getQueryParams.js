export default function getQueryParams(location) {
	const params = {};
	location.search
		.substr(1)
		.split("&")
		.map(p => p.split("="))
		.forEach(p => (params[p[0]] = p[1]));
	return params;
}
