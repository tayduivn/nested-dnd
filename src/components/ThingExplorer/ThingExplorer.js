import React from 'react';
import { Checkbox } from 'react-bootstrap';

import thingStore from '../../stores/thingStore.js';
import tableStore from '../../stores/tableStore.js'
import PackLoader from '../../util/PackLoader.js';
import {uniq,copyToClipboard} from '../../util/util.js';
import ThingChoice from './ThingChoice';
import ThingView from './ThingView';

import './ThingExplorer.css';

class NewPack extends React.Component{
	constructor(props){
		super(props);
		this.copyThings = this.copyThings.bind(this);
		this.copyTables = this.copyTables.bind(this);
		this.createNewThing = this.createNewThing.bind(this);
	}
	createNewThing(){
		var value = document.getElementById("newThingName").value;
		var newThing = thingStore.add({name: value});
		this.props.updatePack(null, {}, newThing);
	}
	copyThings(){
		var str = JSON.stringify(this.props.newPack.things);
		copyToClipboard(str.substring(1,str.length-1));
		console.log(str);
	}
	copyTables(){
		var str = JSON.stringify(this.props.newPack.tables);
		copyToClipboard(str.substring(1,str.length-1));
		console.log(str);
	}
	render(){
		var numThings = Object.keys(this.props.newPack.things).length;
		var numTables = Object.keys(this.props.newPack.tables).length;
		var hasData = numTables || numThings;
		var addThing = (<span className="form-inline">
				<input className="form-control input-sm" id="newThingName" type="text" />
				<button className="btn btn-sm btn-default" onClick={this.createNewThing}>Add Thing</button>
			</span>);

		var message = (<div>Update things to generate your own pack {addThing}</div>);
		if(hasData){
			message = (<div>
				your new pack has <strong>{numThings}</strong> new things and <strong>{numTables}</strong> new tables 
				{addThing}
				<div className="pull-right">	
					<button className="btn btn-sm btn-success" onClick={this.copyThings}>copy things</button>
					<button className="btn btn-sm btn-success" onClick={this.copyTables}>copy tables</button>
				</div>
			</div>);
		}

		return (<div className={"notification-holder alert "+(hasData ? "alert-success" : "alert-primary")}>
			{message}
		</div>);
	}
}

class ThingExplorer extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			things: null,
			currentThing: null,
			newPack: {things: {},tables:{}}
		};

		this.thingsList = [];
		this.thingNames = [];
		this.thingOptions = [];
		this.iconsOptions = [];

		this.filterList = this.filterList.bind(this);
		this.selectThing = this.selectThing.bind(this);
		this.updatePack = this.updatePack.bind(this);
	}
	getThings() {
		this.thingNames = thingStore.getSortedThingNames();
		this.thingsList = thingStore.getThings(this.thingNames);
		this.thingOptions = thingStore.getGenericThingNames()
			.map((name) =>{ return {value:name,label:name} });
	}
	componentDidMount() {
		if(this.thingsList.length){
			var state = {
				things: this.thingsList,
				currentThing: this.thingsList[0]
			};
			this.setState(state)
			return;
		}

    var _this = this;
		PackLoader.load(function(packs){
			_this.getThings();

			//load icons options
			uniq(tableStore.get("*GAME ICONS*")).forEach(function(icon){
				_this.iconsOptions.push({ value: "gi gi-"+icon, label: icon.replace(/-/g," ") })
			})
			uniq(tableStore.get("*FONTAWESOME ICONS*")).forEach(function(icon){
				_this.iconsOptions.push({ value: "fa fa-"+icon, label: icon.replace(/-/g," ") })
			});
			_this.iconsOptions = _this.iconsOptions.sort(function(a,b){ 
				return a.label.localeCompare(b.label) 
			});

			var state = {
				things: _this.thingsList,
				currentThing: _this.thingsList[0]
			};
			_this.setState(state)
		});
  }

	doFilter(query, isMissingIcons){
		var result;

		if(!query && !isMissingIcons){
			result = this.thingsList;
		}
		else{
			result = this.thingsList.filter((t) => {
				var match= (t.name.toLowerCase().includes(query) || (t.isa && t.isa.toLowerCase().includes(query)));
				var missingIcon = t.getIcon() === "empty";
				if(!isMissingIcons) return match;
				else if(!query) return missingIcon;
				return match && missingIcon;
			});
		}
		return result;
	}

	filterList(event){
		var state = {};
		if(event.currentTarget.name === "query")
			state.query = event.target.value.toLowerCase();
		if(event.currentTarget.name === "isMissingIcons")
			state.isMissingIcons = event.currentTarget.checked;

		state.things = this.doFilter(state.query, state.isMissingIcons);
		this.setState(state);
	}

	selectThing(thing){
		this.setState({currentThing: thing});
	}
	updatePack(originalName, updates, newThing){
		if(originalName){
			updates = Object.assign({}, thingStore.get(originalName).originalOptions, updates )
		}
		
		var newThings =  Object.assign({}, this.state.newPack.things, { [newThing.name]: updates } )
		var newPack = Object.assign({}, this.state.newPack, {
			things: newThings });

		this.getThings();

		this.setState({
			things: this.doFilter(this.state.query),
			currentThing: newThing,
			newPack: newPack
		});

		console.log(JSON.stringify(this.state.newPack.things));
	}

	render(){
		if(!this.state.things) 
			return <div>LOADING</div>;
		var things = this.state.things;
		var thingList = things.map((thing) => (
			<ThingChoice key={thing.name} thing={thing} currentThing={this.state.currentThing} selectFunc={this.selectThing} />
		) );

		return (
			<div className="container-fluid">
				<div className="row">
					<div className="col-sm-3 col-md-2 sidebar">
						<div id="thingSearch" className="form-group has-feedback">
							<input type="text" name="query" className="form-control" placeholder="Search" onChange={this.filterList}/>
							<span className="glyphicon glyphicon-search form-control-feedback" aria-hidden="true"></span>
						</div>
						<Checkbox className="col-xs-12" name="isMissingIcons" onChange={this.filterList} value={this.state.isMissingIcons}>
							Missing an icon
						</Checkbox>
						<div className="list-group">{thingList}</div>
					</div>
					<div id="thingView" className="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 ">
						<NewPack newPack={this.state.newPack} updatePack={this.updatePack} />
						<div className="main">
							<ThingView 
								thing={this.state.currentThing} 
								thingOptions={this.thingOptions}
								iconsOptions={this.iconsOptions}
								updatePack={this.updatePack} />
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default ThingExplorer;