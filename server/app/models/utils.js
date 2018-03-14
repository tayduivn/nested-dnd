
module.exports = {

	/**
	 * Return a number between min and max, included.
	 * @param  {Integer} min
	 * @param  {Integer} max
	 * @return {Integer}
	 */
	rand: function(min,max){
		return Math.floor(Math.random()*(max-min+1))+parseInt(min,10);
	}
}