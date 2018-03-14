import tableStore from '../stores/tableStore.js'

function Contain(value){
	this.value = tableStore.roll(value);
	this.makeProb = 100;
	this.makeAmount = 1;
	this.isEmbedded = false;

	//extract modifiers out of the value
	var doEmbed = this.value.charAt(0) === ".";
	if(doEmbed){
		this.isEmbedded = true;
		this.value = this.value.substring(1);
	}

	var valueArray = this.value.split(",");
	if (typeof valueArray[1]!=="undefined" && !isNaN(valueArray[1].split("-")[0].split("%")[0] )){
		extractModifiers.call(this,valueArray[1]);
		this.value = valueArray[0];
	}

	function extractModifiers(mod){
		if(typeof mod !== "string")
			throw new Error("modifiers need to be strings. Can be %, amount, or range")

		if(mod === "."){
			this.isEmbedded = true;
			return;
		}

		//percentage
		mod=mod.split("%");
		if (mod[1] !== undefined){
			this.makeProb = mod[0];
			return;
		}
		mod = mod[0];

		//range
		mod=mod.split("-");
		if (typeof mod[1] === "undefined"){
			this.makeAmount = mod[0];
			this.makeMin = mod[0];
		}
		else{
			this.makeAmount = Math.rand(mod[0],mod[1]);
			this.makeMin = mod[0];
			this.makeMax = mod[1];
		}
	}
	this.isIncluded = function(){
		return Math.random()*100<=this.makeProb;
	}
}
export default Contain;