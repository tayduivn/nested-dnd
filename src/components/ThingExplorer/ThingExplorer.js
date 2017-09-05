import React from 'react';
import { Checkbox } from 'react-bootstrap';

import thingStore from '../../stores/thingStore.js';
import PackLoader from '../../util/PackLoader.js';
import {valueIsUndefined} from '../../util/util.js';
import ThingChoices from './ThingChoice';
import ThingView from '../ThingView/ThingView';
import NewPackInfo from './NewPackInfo';
import SaveThingAction from '../../actions/SaveThingAction';
import ExportPackAction from '../../actions/ExportPackAction';

import './ThingExplorer.css';

const DEBUG = false;

function getInitialState(){
	return {
		filteredThings: thingStore.sortedThingNames,
		currentThing: thingStore.get(thingStore.sortedThingNames[0]),
		lookupName: thingStore.sortedThingNames[0],
		newPack: PackLoader.getNewPack()
	};
}

class ThingExplorer extends React.Component{
	constructor(props){
		super(props);

		this.state = {
			filteredThings: null,
			currentThing: null, 
			lookupName: null,  
			newPack: {things: {},tables:{}},
			addedThings: []
		};

		this.filterList = this.filterList.bind(this);
		this.selectThing = this.selectThing.bind(this);
		this.updateThing = this.updateThing.bind(this);
		this.saveThing = this.saveThing.bind(this);
		this.exportPack = this.exportPack.bind(this);
	}

	componentDidMount() {
		if(thingStore.sortedThingNames.length){
			this.setState(getInitialState());
			return;
		}

		var _this = this;
		PackLoader.load(function(packs){
			thingStore.bindListener('ThingExplorer',()=>{
				_this.setState({filteredThings: _this.doFilter(_this.state.query, _this.state.isMissingIcons)});
			});

			_this.setState(getInitialState())
		});
	}

	componentWillUnmount(){
		thingStore.unbindListener('ThingExplorer');
	}

	exportPack(packName){
		ExportPackAction(packName, this.state.newPack)
	}

	/**
	 * setting value to null will reset the property to its original value
	 * before it was edited. 
 	 */
	updateThing(property, value, reset){
		var thing = this.state.currentThing;
		var newPack = this.state.newPack.things[this.state.lookupName];

		if(DEBUG){
			if(thing !== thingStore.get(this.state.lookupName)){
				console.error("ThingExplorer -- rogue thing not in thingStore");
			}
			console.log("Update "+thing.name+" "+property+": "+value+"  (reset: "+reset);
		}

		// don't reset when equals originalOptions -- annoying while typing
		const doReset = reset || (valueIsUndefined(value) && thing.originalOptions[property] === undefined);
		const inNewPack = newPack && newPack[property] !== undefined;

		(doReset) ? thingStore.resetProperty(thing, property, inNewPack) : thing.setProperty(property, value);
		
		if(DEBUG){
			console.log("* Acheron background: "+thingStore.get("Acheron").background);
		}

		this.setState({currentThing:thing});

	}

	saveThing(lookupName, isDelete){
		var state = SaveThingAction.call(this, lookupName, isDelete);
		if(DEBUG){
			if(state.currentThing && state.currentThing !== thingStore.get(state.currentThing.name)){
				console.error("ThingExplorer -- rogue thing not in thingStore");
			}
		} 
		if(DEBUG){
			console.log("* Acheron background: "+thingStore.get("Acheron").background);
		}
		this.setState(state);
	}

	doFilter(query, isMissingIcons){
		if(!query && !isMissingIcons){
			return thingStore.sortedThingNames;
		}

		return thingStore.sortedThingNames.filter((name) => {
			var match	= false;
			var t;

			if(query){
				match = name.toLowerCase().includes(query)
				if(!match){
					t = thingStore.get(name);
					if(typeof t.isa === "string")
						match = t.isa.toLowerCase().includes(query)
					else if(t.isa && t.isa.find)
						match = t.isa.find((str) => str.toLowerCase().includes(query)) !== undefined;
				}
				if(!match || !isMissingIcons) return match;
			}

			//process isMissingIcons
			if(!t) t = thingStore.get(name);
			return !t.icon && !t.isa;
		});
	}

	filterList(event){
		var query = this.state.query;
		var isMissingIcons = this.state.isMissingIcons;
		var state = {};

		if(event){
			if(event.currentTarget.name === "query"){
				query = state.query = event.target.value.toLowerCase();
			}
			if(event.currentTarget.name === "isMissingIcons"){
				isMissingIcons = state.isMissingIcons = event.currentTarget.checked;
			}
		}

		var things = this.doFilter(query, isMissingIcons);
		if(!things.equals(this.state.things))
			state.filteredThings = things;

		this.setState(state);
	}

	selectThing(name){
		if(DEBUG){
			console.log("*~~~~~~~~~ Acheron background: "+thingStore.get("Acheron").background);
		}
		if(!this.state.currentThing || name !== this.state.currentThing.name){
			//need to process isa every time in case super was changed
			var state = {
				currentThing: thingStore.get(name),
				lookupName: name
			}
			if(DEBUG){
				console.log("*$$$$$$$$ Acheron background: "+thingStore.get("Acheron").background);
			}
			this.setState(state);
		}
	}

	render(){
		if(DEBUG){
			console.log("ThingExplorer RENDER ---------------------");
		}

		const page = (
			<div className="row">
				<div id="thingSearch" className="col-sm-3 col-md-2 sidebar">
					<div className="search form-group has-feedback">
						<input type="text" name="query" className="form-control" placeholder="Search" onChange={this.filterList}/>
						<span className="glyphicon glyphicon-search form-control-feedback" aria-hidden="true"></span>
					</div>
					<Checkbox className="col-xs-12" name="isMissingIcons" onChange={this.filterList} value={this.state.isMissingIcons}>
						Missing an icon
					</Checkbox>
					<ThingChoices things={this.state.filteredThings} currentThing={this.state.currentThing} 
						currentThingName={this.state.lookupName} 
						selectFunc={this.selectThing} saveThing={this.saveThing} />
				</div>
				<div id="thingView" className="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 ">
					
					<div className="main">
						<ThingView thing={ {...this.state.currentThing} } thingID={this.state.lookupName} 
							updateThing={this.updateThing} saveThing={this.saveThing} newPack={this.state.newPack.things[this.state.lookupName]}/>
					</div>
				</div>
			</div>
		)

		return (
			<div className="container-fluid">
				<NewPackInfo newPack={this.state.newPack} export={this.exportPack} />
				{ (!thingStore.sortedThingNames.length) ? <p>No things are defined</p> : page }
			</div>
		)
	}
}

export default ThingExplorer;