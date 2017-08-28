import React from 'react';
import Select from 'react-select';
import { FormGroup, ControlLabel, FormControl, Checkbox, Button } from 'react-bootstrap';

import Styler from '../../util/Styler';
import thingStore from '../../stores/thingStore';
import tableStore from '../../stores/tableStore'
import IconSelect from './IconSelect';
import ContainsList, {EditableInput} from './ContainsList';


class ThingFunctions extends React.Component {
	render(){
		return (<div>
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
		</div>);
	}
}

class ThingView extends React.Component{
	constructor(props){
		super(props);
		this.props = props;

		var t = this.props.thing;
		this.state = {};
		this.state = this.thingToState(t,this.state);

		this.handleChange = this.handleChange.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
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
			thing: t,
			iconsOptions: this.props.iconsOptions
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
	componentWillReceiveProps(nextProps, nextState){
		if (nextProps.thing !== this.state.thing) {
			console.log("ThingView WILL UPDATE");
			if(Object.keys(this.state.updates).length){
				this.handleSubmit();
			}
			this.setState(this.thingToState(nextProps.thing));
		}
	}
	changeProperty(property, value, index){
		var updates = this.state.updates;
		updates[property] = value;

		var state = {
			[property]: value
		};
		if(property === "icon"){
			var cssClass = this.state.cssClass;
			var randomIcon = null;

			if(value.length === 1) value = value[0];

			if(value){
				cssClass = cssClass.replace(" empty","");
				randomIcon = tableStore.roll(value);
			}
			else if(!cssClass.includes("empty"))
				cssClass+= " empty";

			state.cssClass = cssClass;
			state.randomIcon = randomIcon;
		}
		else if(property === "background"){
			state.cssClass = Styler.getClass(state);
			if(!this.state.icon) state.cssClass+=" empty"
		}
		else if(property === "isa"){
			var options = Object.assign({}, this.props.thing.originalOptions, updates);
			state = this.thingToState(thingStore.add(options), updates);
		}
		else if(property === "namegen"){
			if(value === this.state.thing.namegen){
				delete updates.namegen;
			}

			if(!value || value === ""){
				state.randomName = this.state.name;
			}
			else
				state.randomName = tableStore.roll(value);
		}else if(property === "contains"){
			var contains = this.state.contains;
			if(value === null && index < contains.length){
				contains.splice(index,1);
			}else{
				try{
					value = JSON.parse(value);
				}
				catch(e){}
				contains[index] = (value) ? value : "";
			}
			state.contains = contains;
			updates.contains = contains;
		}

		if(state[property] === undefined)
			state[property] = "";

		state.updates = updates;

		this.setState(state);
	}
	handleChange(event, index){
		var el = event.currentTarget;
		var property = el.getAttribute("name");

		var value = el.value;

		this.changeProperty(property, value, index);
	}
	handleSubmit(){
		var options = Object.assign({}, this.props.thing.originalOptions, this.state.updates);
		var thing = thingStore.add(options);
		this.props.updatePack(this.props.thing.name, this.state.updates, thing);
	}
	handleClick(event, disabled){
		var input = event.currentTarget.closest(".input-group").querySelector(".form-control");
		var property = input.getAttribute("name");
		var value = input.getAttribute("value");
		if(value && disabled) value+=" ";
		console.log(event.target.nodeName+"\t\t"+property+": "+value)

		if(!disabled){
			value = this.state.thing[property];
		}
		this.changeProperty(property,value)
		input.focus();
	}
	disabled(property){
		if(this.state.updates[property] !== undefined)
			return false;
		if(this.state[property] === undefined || this.state[property] === null || this.state[property] === ""){
			return true;
		}
		//if it hasn't been updated and it's not the same as the original option, that means it's inherited
		if(this.state[property] !== this.props.thing.originalOptions[property]){
			return true;
		}
		if(!this.state[property]) return true; 

		return false;
	}
	render(){
		return (
			<div className="thingView row">
				<div className="properties col-lg-10 col-md-9 col-sm-8 col-xs-6">
					<FormGroup>
						<h1>
							<FormControl name="name" type="text" bsSize="large" value={this.state.name} onChange={this.handleChange} />
						</h1>
					</FormGroup>
					<FormGroup>
						<label>Is a...</label>
						<Select name="isa" value={this.state.isa} 
							onChange={(option) => { this.changeProperty("isa", option.value)} }
							clearValueText="Clear changes" resetValue={this.props.thing.isa}
							options={this.props.thingOptions}>
						</Select>
					</FormGroup>
					<FormGroup>
						<label>Name generator</label>
						<EditableInput disabled={this.disabled("namegen")} handleClick={this.handleClick}>
							<input className="form-control" name="namegen" type="text" 
								value={this.state.namegen} 
								disabled={this.disabled("namegen")} onChange={this.handleChange} />
						</EditableInput>
					</FormGroup>
					<ContainsList list={this.state.contains} handleChange={this.handleChange} 
							disabled={this.disabled("contains")} />
					<FormGroup>
						<label>Icon</label>
							<IconSelect value={this.state.icon} 
								resetValue={this.props.thing.originalOptions.icon}
								onChange={(value) => {this.changeProperty("icon", value.split(","))} } 
								options={ this.state.iconsOptions } /> 
					</FormGroup>
					<FormGroup>
						<label>Background</label>
						<Select name="background" value={this.state.background} 
							clearValueText="Clear changes" resetValue={this.props.thing.background}
							optionRenderer={renderColorOption}
							onChange={(option) => {this.changeProperty("background", option.value)} } options={Styler.getColorOptions()}/>
					</FormGroup>
					<FormGroup>
						<label>Text Color</label>
						<Select name="textColor" value={this.state.textColor} 
							clearValueText="Clear changes" resetValue={this.props.thing.textColor}
							optionRenderer={renderColorOption}
							onChange={(option) => {this.changeProperty("textColor", option.value)} } options={Styler.getColorOptions()} />
					</FormGroup>
					<FormGroup>
						<label>Data (JSON format)</label>
						<EditableInput disabled={this.disabled("data")} handleClick={this.handleClick}>
								<textarea name="data" className="form-control" value={this.state.data} 	onChange={this.handleChange} disabled={this.disabled("data")} ></textarea>
						</EditableInput>
					</FormGroup>
					<ThingFunctions thing={this.props.thing} />
					<Button className={Object.keys(this.state.updates).length ? "btn-danger" : "btn-default"} onClick={this.handleSubmit}>Save</Button>
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

function renderColorOption(option){
	return (
		<div><i className="fa fa-2x fa-square" style={{color: option.value}}></i>  {option.label}</div>
	);
}

export default ThingView;