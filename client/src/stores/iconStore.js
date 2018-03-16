import tableStore from './tableStore';

let iconStore = {};

iconStore.iconOptions  = [];

iconStore.makeLabel = function(str){
	if(!str) return "";
	if(str.constructor.name === "Array"){
		return str.map((s)=>replace(s));
	}
	return replace(str);
	function replace(str){
		return str.replace(/-/g," ").replace(/gi gi /g,"").replace(/glyphicon glyphicon /g,"").replace(/fa fa /g,"").replace(/fa flaticon /g,"").replace(/fa spin/g,"spin")
	}
}

iconStore.extractSpin = function(value){
	if(value === "empty"){
		return { value: "", spinning: [] };
	}
	var arr = (value.constructor.name === "Array") ? value : [value];
	var result = {
		value: [],
		spin: []
	}
	arr.forEach((value) => {
		if(value.includes(" fa-spin") || value.includes(" gi-spin")){
			result.value.push(value.replace(" fa-spin","").replace(" gi-spin",""));
			result.spin.push(true);
		}
		else{
			result.value.push(value);
			result.spin.push(false);
		}
	});

	return result;
}

iconStore.load = function(){

	var all = tableStore.get("ALL ICONS").rows;

	this.iconOptions = all.map((value) => {return {label: this.makeLabel(value), value: value}} );
	this.iconOptions = [{label:"none",value:null}].concat(this.iconOptions);
}


export default iconStore;
