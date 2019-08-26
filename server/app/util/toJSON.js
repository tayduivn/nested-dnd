module.exports = err => {
	var alt = {};

	Object.getOwnPropertyNames(err).forEach(function(key) {
		alt[key] = err[key];
	}, err);

	return alt;
};
