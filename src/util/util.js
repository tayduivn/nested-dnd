import tableStore from '../stores/tableStore.js';

Array.prototype.roll = function(){ // eslint-disable-line
	var result = choose(this);

	//termination condition: no roll function;
	return tableStore.roll(result);
}

Math.rand = function(min,max){// eslint-disable-line
	//Return a number between min and max, included.
	return parseFloat(Math.floor(Math.random()*(max-min+1)))+parseFloat(min);
}

function uniq(a) {
	var prims = {"boolean":{}, "number":{}, "string":{}}, objs = [];

	return a.filter(function(item) {
			var type = typeof item;
			if(type in prims)
					return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
			else
					return objs.indexOf(item) >= 0 ? false : objs.push(item);
	});
}

function choose(arr){
	//Returns an element from an array at random.
	var result = arr[Math.floor(Math.random()*arr.length)];

	if(result.value)
		result = result.value;
	return result;
}

function weightedChoose(arr,weightChoose){
	//Returns an element from an array at random according to a weight.
	//A weight of 2 means the first element will be picked roughly twice as often as the second; a weight of 0.5 means half as often. A weight of 1 gives a flat, even distribution.
	if (weightChoose<=0 || weightChoose===undefined) weightChoose=1;
	var result = arr[Math.floor(Math.pow(Math.random(),weightChoose)*arr.length)];
	
	if(result.value)
		result = result.value;
	return result;
}

function weightedDiceChoose(arr){
	if(!(arr instanceof Array)){
		throw  new Error("arr must be instanceof Array");
	}

	var dSize = 0;
	var percentages = [];
	var value, weight;
	var row;

	arr = arr.slice();

	//sum weights
	for(var i = 0; i < arr.length; i++){
		row = arr[i];
		if(row.weight){
			value = row.value;
			weight = row.weight;
		}else if(typeof row === "string"){
			var parts = row.split(",");
			value = parts[0];
			weight = (parts[1]) ? parseInt(parts[1],10) : 1;
		}else{
			value = row;
			weight = 1;
		}

		dSize+= weight;
		percentages.push(weight);
		arr[i] = value;
	}
	var threshold = 0;
	var dRoll = Math.rand(1,dSize);
	
	for(i = 0; i < percentages.length; i++){
		threshold+= percentages[i];
		if(dRoll <= threshold){
			return arr[i];
		}
	}
}



export {uniq,choose,weightedChoose,weightedDiceChoose}