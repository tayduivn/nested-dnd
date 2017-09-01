import thingStore from '../stores/thingStore.js';
import {clean,valueIsUndefined} from '../util/util.js';

const BLANK_NAME = " ";
const DEBUG = false;

function SaveThingAction(lookupName, isDelete){
	if(DEBUG) console.log("SaveThingAction. "+(isDelete ? "DELETE" : ""));

	var state = {};
	if(isDelete){
		state = deleteThing.call(this, lookupName);
	}
	else if(lookupName === undefined){
		state = addBlankThing.call(this);
	}
	else{
		var thing = (lookupName === this.state.lookupName) ? this.state.currentThing : thingStore.get(lookupName);

		if(lookupName === thing.name){
			state = updatePack.call(this, thing);
		}else{
			state = updatePackRename.call(this, lookupName, thing);
		}
	}
	if(state.updatedThings){
		state.newPack = {...this.state.newPack, things: state.updatedThings };
		delete state.updatedThings;
	}

	if(state.newPack){
		state.newPack.tables = {}; // temp until I do a table explorer
		localStorage.newPack = JSON.stringify(state.newPack)
		if(DEBUG){
			console.log("-------------- SaveThingAction -------------");
			console.log(state.newPack);
		} 
	}
	this.setState(state);
}

function addBlankThing(){
	var thing = thingStore.add({name: BLANK_NAME});
	return {
		lookupName: BLANK_NAME,
		currentThing: thing,
	};
}

function deleteThing(name){
	var state = (name !== BLANK_NAME) ? updatePackDelete.call(this, name) : {};

	thingStore.delete(name);

	state.lookupName = null;
	state.currentThing = null;
	return state;
}

function updatePack(thing){
	var state = {};
	state.updatedThings = extractUpdates.call(this, thing);
	if(thing.name === this.state.lookupName){
		state.currentThing = thing;
	}
	return state;
}



function updatePackRename(oldName, thing){
	var state = {};

	state.addedThings = deleteIfWasAddedByUser.call(this, oldName);
	
	state.updatedThings = extractUpdates.call(this, thing);

	// if the old name was not added by the user
	if(oldName !== BLANK_NAME){
		if(state.addedThings.length === this.state.addedThings.length){
			state.updatedThings[oldName] = false;
		}
		else{
			delete state.updatedThings[oldName];
		}
	}
	state.addedThings.push(thing.name);

	//this affects the filter list and makes available to render
	thing = thingStore.rename(oldName, thing.name);
	thing._updatedProps = [];

	//saving the currently open thing -- do last so it can find the thing
	if(oldName === this.state.lookupName){
		state.lookupName = thing.name;
		state.currentThing = thing;

		setTimeout(() =>{
			window.location.hash = '#'+encodeURIComponent(thing.name);
		},10)
	}

	return state;
}

function updatePackDelete(lookupName){
	//deleting something I added
	var findIndex = this.state.addedThings.indexOf(lookupName);
	if(findIndex !== -1){
		var updatedThings = {...this.state.newPack.things}; 
		delete updatedThings[lookupName];

		return {
			updatedThings: updatedThings,
			addedThings: deleteIfWasAddedByUser.call(this, lookupName)
		}
	}

	return {
		updatedThings: {...this.state.newPack.things, [lookupName]: false}
	};
}

// extract the updated values into the updates object
function extractUpdates(thing){
	var updates = {}, updatedThings;
	thing._updatedProps.forEach((prop) => {
		if(valueIsUndefined(thing[prop])) thing[prop] = undefined;
		
		if(thing[prop] !== thing.originalOptions[prop])
			updates[prop] = thing[prop]
		else // reset the value
			updates[prop] = undefined
	});

	// if there is already a new pack, combine
	if(thing._newPack){
		updates = {...thing._newPack, ...updates};
		updates = clean(updates);
	}
	thing._newPack = updates;
	thing._updatedProps = [];

	// if there are updates, add them, otherwise keep as-is
	if(Object.keys(updates).length)
		updatedThings = {...this.state.newPack.things, [thing.name]: updates}
	else{
		updatedThings = this.state.newPack.things;
		delete updatedThings[thing.name];
	}

	return updatedThings;
}

function deleteIfWasAddedByUser(name){
	var addedThings = [].concat(this.state.addedThings);
	if(this.state.addedThings.includes(name)){
		addedThings.splice(addedThings.indexOf(name), 1);
	}
	return addedThings;
}

export default SaveThingAction;