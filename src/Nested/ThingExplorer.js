import React, { Component } from 'react';
import { FormGroup, ControlLabel, FormControl, Checkbox, Button, InputGroup } from 'react-bootstrap';
import Select from 'react-select';
import VirtualizedSelect from 'react-virtualized-select'

import Thing from './Thing.js';
import Table from './Table.js';
import Pack from './Pack.js';
import Styler from './Styler.js';
import {uniq} from './Debug.js';


var thingsList = [];
var thingNames = [];

var iconsOptions = [];

function getIconsOptions(str){
	if(typeof str === "string"){
		var allOptions = iconsOptions.map((o) => o.value);
		if(!allOptions.includes(str)){
			iconsOptions.push({
				value: str,
				label: makeLabel(str)
			})
		}
	}
	return iconsOptions;
};

function renderIcon({ focusedOption, focusedOptionIndex, focusOption, key, labelKey, option, options, selectValue, style, valueArray }) {
	return (
		<div className="icon-option" key={key}
      onClick={() => selectValue(option)}
      onMouseOver={() => focusOption(option)}
      style={style}
    ><i className={option.value}/> {option.label}</div>
	)
}

function makeLabel(str){
	if(!str) return "";
	return str.replace(/-/g," ").replace(/gi gi /g,"").replace(/fa fa /g,"").replace(/fa flaticon /g,"").replace(/fa spin/g,"spin")
}

class ThingChoice extends Component{
	constructor(props){
		super(props);
		this.handleClick = this.handleClick.bind(this)
	}

	handleClick(thing){
		this.props.selectFunc(thing)
	}
	render(){
		var t = this.props.thing;
		var curr = this.props.currentThing;
		t.processIsa();
		var icon = t.icon;
		if(icon.roll) icon = icon[0];

		return (
			<a className={"list-group-item "+((curr === t) ? "active":"")} href="#"
				onClick={() => this.props.selectFunc(this.props.thing)}>
				<h4 className="no-margin"><i className={icon}></i> {t.name}</h4>
				{t.isa}
			</a>
		)
	}
}

class PropertyInput extends Component{
	render(){
		var children = React.Children.map(this.props.children,
     (child) => React.cloneElement(child, {
       disabled: this.props.disabled
     })
    );

		return (
			(<InputGroup className={this.props.disabled ? "": "no-input-addons"} disabled={this.props.disabled}>
				<InputGroup.Addon className={"btn btn-danger "+(this.props.disabled ? "": "hidden")} 
					onClick={(e) => this.props.handleClick(e) }><i className="fa fa-pencil"></i> Edit</InputGroup.Addon>
				 {children}
			</InputGroup>)
		)
	}
}

class ThingView extends React.Component{
	constructor(props){
		super(props);
		this.props = props;
		console.log("ThingView CONSTRUCTOR");

		var t = this.props.thing;
		this.state = {};
		this.state = this.thingToState(t,this.state);

		this.handleChange = this.handleChange.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChangeIsa = this.handleChangeIsa.bind(this);
		this.changeProperty = this.changeProperty.bind(this);
	}
	thingToState(t, oldState){
		t.processIsa();
		var newState = {
			updates: {}, //wipe out updates
			name: t.name,
			randomName: t.getName(),
			isa: (t.isa) ? t.isa : "",
			icon: (t.icon !== "empty") ? t.icon : "",
			namegen: (!t.namegen) ? "" : (typeof t.namegen === "string") ? t.namegen : JSON.stringify(t.namegen),
			randomIcon: t.getIcon(),
			contains: (t.contains) ? t.contains : [],
			background: (t.background) ? t.background : "",
			textColor: (t.textColor) ? t.textColor : "",
			originalOptions: (t.originalOptions) ? t.originalOptions : {},
			data: (!t.data || Object.keys(t.data).length===0) ? "" : JSON.stringify(t.data),
			autoColor: !(t.autoColor === false),
			uniqueInstance: t.uniqueInstance === true,
			cssClass: (t.cssClass) ? t.cssClass : "",
			thing: t
		};
		if(newState.randomName === undefined){
			console.error("thing doesn't have name!")
		}
		if(t.autoColor){
			var color = Styler.strToColor(newState.randomName);
			if(color){
				newState.cssClass+=" "+color;
			}
		}
		if(newState.randomIcon === "empty"){
			newState.cssClass += " empty";
		}

		if(oldState){
			return Object.assign({}, oldState, newState);
		}
		else return newState;
	}
	componentWillReceiveProps(nextProps){
		if (nextProps.thing !== this.state.thing) {
			console.log("ThingView WILL UPDATE");
			this.setState(this.thingToState(nextProps.thing));
		}
	}
	changeProperty(property, value){
		var updates = this.state.updates;
		updates[property] = value;

		var updates = {
			[property]: value,
			updates:updates
		};
		if(property == "icon"){
			var cssClass = this.state.cssClass;
			var randomIcon = null;

			if(value.length == 1) value = value[0];

			if(value){
				cssClass = cssClass.replace(" empty","");
				randomIcon = Table.roll(value);
			}
			else if(!cssClass.includes("empty"))
				cssClass+= " empty";

			updates.cssClass = cssClass;
			updates.randomIcon = randomIcon;
		}
		else if(property === "background"){
			updates.cssClass = Styler.getClass(updates);
			if(!this.state.icon) updates.cssClass+=" empty"
		}

		this.setState(updates);

		
	}
	handleChange(event){
		var property = event.target.name;
		var value = event.target.value;
		this.changeProperty(property, value);
		event.target.focus()
	}
	handleChangeIsa(option){
		this.changeProperty("isa", option.value)
	}
	handleSubmit(){
		var options = Object.assign({}, this.props.thing.originalOptions, this.state.updates);

		//submit each value
		var thing = new Thing(options);


		//clean values

		this.props.updatePack(this.props.thing.name, this.state.updates, thing);
	}
	handleClick(event){
		var input = event.target.nextElementSibling;
		if(!input){
			console.error("can't find input");
			return;
		}
		if(input.disabled == true){
			input.disabled = false;
		}
		input.focus();
		console.log("test");
	}
	disabled(property){
		if(this.state.updates[property] !== undefined)
			return false;
		if(this.state[property] == undefined || this.state[property] == null || this.state[property] == ""){
			return true;
		}

		//if it hasn't been updated and it's not the same as the original option, that means it's inherited
		if(this.state[property] !== this.props.thing.originalOptions[property]){
			return true;
		}

	}
	render(){
		return (
			<div id="thingView" className="thingView row">
				<div className="properties col-lg-10 col-md-9 col-sm-8 col-xs-6">
					<FormGroup>
						<h1>
							<FormControl name="name" type="text" bsSize="large" value={this.state.name} onChange={this.handleChange} />
						</h1>
					</FormGroup>
					<FormGroup>
						<label>Is a...</label>
						<Select name="isa" value={this.state.isa} onChange={this.handleChangeIsa}
							clearValueText="Clear changes" resetValue={this.props.thing.isa}
							options={thingNames.map((name) =>{ return {value:name,label:name} })}>
						</Select>
					</FormGroup>
					<FormGroup>
						<label>Name generator</label>
						<PropertyInput disabled={this.disabled("namegen")} handleClick={this.handleClick}>
							<FormControl name="namegen" type="text" 
								value={this.state.namegen} 
								disabled={this.disabled("namegen")} onChange={this.handleChange} />
						</PropertyInput>
					</FormGroup>
					<FormGroup>
						<label>Contains</label>
						{this.state.contains.map((item, index) => (
							<PropertyInput key={index} disabled={this.disabled("contains")} handleClick={this.handleClick}>
								<FormControl name="contains" type="text" value={(typeof item === "string") ? item : JSON.stringify(item) } disabled={this.disabled("contains")} 
									onChange={this.handleChange} />
								<InputGroup.Addon>
									<em>{ (item.roll) ? "Table" : (Thing.exists(item)) ? "thing" : "text"}</em>
								</InputGroup.Addon>
							</PropertyInput>
						))}
						<br/>
						<div className={this.state.contains.length ? "":"pull-right"}><Button><i className="fa fa-plus"></i> Add Another</Button></div>
					</FormGroup>
					<FormGroup>
						<label>Icon</label>
							<VirtualizedSelect name="icon" value={this.state.icon} 
								clearable={true} clearValueText="Clear changes" 
								resetValue={ [ { value: this.props.thing.originalOptions.icon, label: makeLabel(this.props.thing.originalOptions.icon) } ] }
								onChange={(value) => {this.changeProperty("icon", value.split(","))} } 
								multi={true} matchProp="label" ignoreCase={false}
								optionRenderer={renderIcon} simpleValue searchable={true}  
								options={ getIconsOptions(this.props.thing.icon) } 
								selectComponent={Select.Creatable} />
					</FormGroup>
					<FormGroup>
						<label>Background</label>
						<Select name="background" value={this.state.background} 
							clearValueText="Clear changes" resetValue={this.props.thing.background}
							optionRenderer={Styler.renderColorOption}
							onChange={(option) => {this.changeProperty("background", option.value)} } options={Styler.getColorOptions()} >
							<option key={"asaksjlkad"}>aslakjslkjd</option>
							</Select>
					</FormGroup>
					<FormGroup>
						<label>Text Color</label>
						<Select name="textColor" value={this.state.textColor} 
							clearValueText="Clear changes" resetValue={this.props.thing.textColor}
							optionRenderer={Styler.renderColorOption}
							onChange={(option) => {this.changeProperty("textColor", option.value)} } options={Styler.getColorOptions()}>
						</Select>
					</FormGroup>
					<FormGroup>
						<label>Data (JSON format)</label>
						<PropertyInput disabled={this.disabled("data")} handleClick={this.handleClick}>
								<textarea name="data" className="form-control" value={this.state.data} 	onChange={this.handleChange} disabled={this.disabled("data")} ></textarea>
						</PropertyInput>
					</FormGroup>
					<FormGroup className={(this.props.thing.b4Make) ? "" : "hidden"} validationState="warning">
						<ControlLabel>beforeMake() - Edit in *.js pack file</ControlLabel>
						<FormControl componentClass="textarea" value={this.props.thing.b4Make} disabled />
					</FormGroup>
					<FormGroup className={(this.props.thing.afMake) ? "" : "hidden"} validationState="warning">
						<ControlLabel>afterMake() - Edit in *.js pack file</ControlLabel>
						<FormControl componentClass="textarea" value={this.props.thing.afMake} disabled />
					</FormGroup>
					<FormGroup className={(this.props.thing.b4Render) ? "" : "hidden"} validationState="warning">
						<ControlLabel>beforeRender() - Edit in *.js pack file</ControlLabel>
						<FormControl componentClass="textarea" value={this.props.thing.b4Render} disabled />
					</FormGroup>
					<Button onClick={this.handleSubmit}>Save</Button>
				</div>
				<div className="child col-lg-2 col-md-3 col-sm-4 col-xs-6">
					<h5>PREVIEW</h5>
					<div className={"child-inner "+this.state.cssClass} style={{color:this.state.textColor}}>
						<i className={this.state.randomIcon}></i>
						<h1>{this.state.randomName}</h1>
					</div>
					<Checkbox name="uniqueInstance" checked={this.state.uniqueInstance} onChange={this.handleChange}>
						Is Unique
					</Checkbox>
					<Checkbox name="autoColor" checked={this.state.autoColor} onChange={this.handleChange}>
						Auto-Color from Name
					</Checkbox>
					<div className="icons-preview">
						{ (this.state.icon && this.state.icon.roll && this.state.icon.length > 1) ? (
							this.state.icon.map((icon) => (<div key={icon}><i className={icon} /><br/>{icon}</div>) )
						) : "" }
					</div>
				</div>
			</div>
		)
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
		this.filterList = this.filterList.bind(this);
		this.selectThing = this.selectThing.bind(this);
		this.updatePack = this.updatePack.bind(this);
	}
	componentDidMount() {
		if(thingsList.length){
			var state = {
				things: thingsList,
				currentThing: thingsList[0]
			};
			this.setState(state)
			return;
		}

    var _this = this;
		Pack.doImport(function(packs){
			var things = Thing.getThings();
			thingsList = Object.values(things);
			thingsList = thingsList.sort((a,b) => a.name.localeCompare(b.name) );
			thingNames = Object.keys(Thing.getThings()).sort((a,b) => a.localeCompare(b));

			//load icons options
			uniq(Table.get("*GAME ICONS*")).forEach(function(icon){
				iconsOptions.push({ value: "gi gi-"+icon, label: icon.replace(/\-/g," ") })
			})
			uniq(Table.get("*FONTAWESOME ICONS*")).forEach(function(icon){
				iconsOptions.push({ value: "fa fa-"+icon, label: icon.replace(/\-/g," ") })
			});
			iconsOptions = iconsOptions.sort(function(a,b){ 
				return a.label.localeCompare(b.label) 
			});

			var state = {
				things: thingsList,
				currentThing: thingsList[0]
			};
			_this.setState(state)
		});
  }

	doFilter(query){
		var result;
		if(!query){
			result = thingsList;
		}
		else{
			result = thingsList.filter((t) => 
				t.name.toLowerCase().includes(query) || (t.isa && t.isa.toLowerCase().includes(query))
			);
		}
		return result;
	}

	filterList(event){
		var query = event.target.value.toLowerCase();

		this.setState({
			query: query,
			things: this.doFilter(query)
		});
	}

	selectThing(thing){
		this.setState({currentThing: thing});
	}
	updatePack(originalName, updates, newThing){

		var newThings =  Object.assign({}, this.state.newPack.things, { [newThing.name]: updates } )
		var newPack = Object.assign({}, this.state.newPack, {
			things: newThings });

		var things = Thing.getThings();
		thingsList = Object.values(things);
		thingsList = thingsList.sort((a,b) => a.name.localeCompare(b.name) );
		thingNames = Object.keys(Thing.getThings()).sort((a,b) => a.localeCompare(b));

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
						<div className="form-group has-feedback">
							<input type="text" className="form-control" placeholder="Search" onChange={this.filterList}/>
							<span className="glyphicon glyphicon-search form-control-feedback" aria-hidden="true"></span>
						</div>
						<div className="list-group">{thingList}</div>
					</div>
					<div className="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
						<ThingView thing={this.state.currentThing} newPack={this.state.newPack} updatePack={this.updatePack} />
					</div>
				</div>
				<div id="notification-holder" className="alert alert-success page-alert">{Object.keys(this.state.newPack.things).length} new things and {Object.keys(this.state.newPack.tables).length} new tables</div>
			</div>
		)
	}
}

export default ThingExplorer;