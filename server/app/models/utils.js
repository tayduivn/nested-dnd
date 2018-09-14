
module.exports = {

	/**
	 * Return a number between min and max, included.
	 * @param  {Integer} min
	 * @param  {Integer} max
	 * @return {Integer}
	 */
	rand: function(min,max){
		return Math.floor(Math.random()*(max-min+1))+parseInt(min,10);
	},

	toJSON: (err)=>{
		var alt = {};

		Object.getOwnPropertyNames(err).forEach(function(key) {
			alt[key] = err[key];
		}, err);

		return alt;
	},

	toUpper: (str) => {
	    return str.split(' ').map(s=>s.charAt(0).toUpperCase()+s.substr(1)).join(' ');
	}
}