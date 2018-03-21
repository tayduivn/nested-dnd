import React from 'react';
import { Creatable  } from 'react-select';

import Styler from '../../util/Styler';

const BLANK_VALUE = <span>&nbsp;</span>;
const DEBUG = true;
const RESET_VALUE = {label: null, value: "DO THE RESET PLEASE AND THANK YOU"}

export default class IsASelect extends React.Component {
	constructor(){
		super();

		this.state = {
			options: this._getIsaOptions()
		}
		this.validationState = null;
		this.helpText = null;

		this.handleChange = this.handleChange.bind(this);
		this.onNewOptionClick = this.onNewOptionClick.bind(this);
		this.onInputKeyDown = this.onInputKeyDown.bind(this);
		this.handleSelectedClick = this.handleSelectedClick.bind(this);
	}
	componentDidMount() {
		/*thingStore.bindListener('IsASelect',()=>{
			this.setState({options: this._getIsaOptions() });
		});*/
	}
	shouldComponentUpdate(nextProps, nextState){
		var changed = nextState !== this.state 
				|| nextProps.value !== this.props.value 
				|| !Object.values(nextProps.status).equals(Object.values(this.props.status));
		if(DEBUG) 
			console.log("\tIsASelect.shouldComponentUpdate: "+changed)
		return changed;
	}
	componentWillUnmount(){
		// thingStore.unbindListener('IsASelect');
	}
	_getIsaOptions(){
		// var options = thingStore.isaOptions.map( (o)=>({value:o,label:o}) );
		// return [{value:false, label: BLANK_VALUE}, ...options];
	}
	onNewOptionClick({value}){
		if(DEBUG) console.log("IsASelect._onNewOptionClick: "+value);

		this.justAdded = true;
		// thingStore.add({name: value});
		this.props.addThing(value);
		this.props.handleChange("isa",value);

		if(this.select) this.select.blurInput();
	}
	handleChange(options){
		if(DEBUG) console.log("IsASelect.handleChange -- "+options);

		var values = [];
		options.forEach((op) => values.push(op.value));

		// don't allow thingname
		var indexOfName = values.indexOf(this.props.thingName);
		if(indexOfName !== -1){
			values.splice(indexOfName,1);
		}

		var value = (values.length === 1) ? values[0] : values;

		// clear value and continue. Not null because can't inherit isa property
		if(value === ""){
			value = undefined;
		}

		if(value === this.props.value) // no change
			return;
		
		if(value === RESET_VALUE.value) // reset - clear to original
			return this.props.handleChange("isa", undefined, true);

		this.justAdded = false;

		if(DEBUG) console.log("\t do updateThing");
		this.props.handleChange("isa",value);
	}
	onInputKeyDown(event) {
		if(event.keyCode === 13) {
			// Override default ENTER behavior -- must click to create
			if(this.select.getFocusedOption().className === "Select-create-option-placeholder"){
				event.preventDefault();
			}
			else{
				this.select.selectFocusedOption();
			}
		}
	}
	handleSelectedClick({value}){
		window.location.hash = "#"+encodeURIComponent(value);
	}
	render (){
		if(DEBUG) 
			console.log("-------  IsASelect RENDER "+this.props.value)

		const value = (this.props.value === undefined) ? [] : this.props.value;
		const helpText = (this.justAdded) ? <span><i className="fa fa-check"/> added new thing <strong>{value}</strong></span> 
			: "";
		
		return (
		<div validationstate={this.props.status.isUpdated?"success":null} className={`form-group ${this.props.status.isEnabled ? "" : "fake-disabled"}`}>
			<label>Is a...</label>
			<Creatable name="isa" value={value} 
				onChange={this.handleChange}
				clearable={this.props.status.isClearable} clearValueText="Clear changes" resetValue={[RESET_VALUE]} 
				options={this.state.options} 
				multi={true} clearRenderer={Styler.selectClear}
				onNewOptionClick={this.onNewOptionClick}
				promptTextCreator={promptCreateNew} 
				reff={(createable) => this.select = (createable) ? createable.select : null} //was ref
				shouldKeyDownEventCreateNewOption={_false} 
				onInputKeyDown={this.onInputKeyDown} onValueClick={this.handleSelectedClick} />
			<small>{helpText}</small>
		</div>);
	} 
}

function promptCreateNew(label){
	return "Click here to create new thing \""+label+"\"";
}
function _false(){
	return false;
}