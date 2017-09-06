import thingStore from '../stores/thingStore.js';
import PackLoader from '../util/PackLoader';

const BLANK_NAME = " ";
const DEBUG = true;

function SaveThingAction(lookupName, isDelete){
	if(DEBUG) console.log("SaveThingAction. "+lookupName+" "+(isDelete ? "DELETE" : ""));

	var state = {};
	var newPack = this.state.newPack.things[lookupName];

	if(isDelete){
		state = deleteThing.call(this, lookupName);
	}
	else if(lookupName === undefined){
		state = addBlankThing.call(this);
	}
	else{

		//get it fresh every time, just in case this.state.currentThing has gone rogue
		var thing = thingStore.get(lookupName);
		if(lookupName !== BLANK_NAME) lookupName = lookupName.trim();
		
		//------------ DataCleanup
		var updates = thing.save();
		updates = {...newPack, ...updates};
		updates = extractUpdates(thing, this.state.newPack.things, updates);

		if(lookupName === thing.name){
			state = updatePack.call(this, thing, updates);
		}else{
			state = updatePackRename.call(this, lookupName, thing, updates);
		}
	}

	//wrap
	if(state.updatedThings){
		state.newPack = {...this.state.newPack, things: state.updatedThings };
		delete state.updatedThings;
	}

	if(state.newPack){
		state.newPack.tables = {}; // temp until I do a table explorer
		PackLoader.setNewPack(state.newPack);
		
		if(DEBUG){
			console.log("-------------- SaveThingAction -------------");
			console.log(state.newPack);
		} 
	}
	if(DEBUG){
		console.log(state);
	}
	return state;
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

function updatePack(thing, updates){
	var state = {};
	state.updatedThings = updates;
	if(thing.name === this.state.lookupName){
		state.currentThing = thing;
	}
	return state;
}

function updatePackRename(oldName, thing, updates){
	var state = {};

	state.addedThings = deleteIfWasAddedByUser.call(this, oldName);
	
	state.updatedThings = updates;

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
function extractUpdates(thing, newThings, updates){
	var updatedThings;

	// if there are updates, add them, otherwise keep as-is
	if(Object.keys(updates).length)
		updatedThings = {...newThings, [thing.name]: updates}
	else{
		updatedThings = newThings;
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