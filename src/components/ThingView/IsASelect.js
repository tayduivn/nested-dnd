import React from 'react';
import { Creatable  } from 'react-select';
import { FormGroup, HelpBlock } from 'react-bootstrap';

import thingStore from '../../stores/thingStore';
import Styler from '../../util/Styler';

const BLANK_VALUE = <span>&nbsp;</span>;
const DEBUG = false;
const resetValue = {label: null, value: null}

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
	}
	componentDidMount() {
		thingStore.bindListener('IsASelect',()=>{
			this.setState({options: this._getIsaOptions() });
		});
	}
	shouldComponentUpdate(nextProps){
		if(DEBUG){
			console.log("* Acheron background: "+thingStore.get("Acheron").background);
		}
		var changed = nextProps.value !== this.props.value 
				|| !Object.values(nextProps.status).equals(Object.values(this.props.status));
		if(DEBUG) 
			console.log("\tIsASelect.shouldComponentUpdate: "+changed)
		return changed;
	}
	componentWillUnmount(){
		thingStore.unbindListener('IsASelect');
	}
	_getIsaOptions(){
		var options = thingStore.isaOptions.map( (o)=>({value:o,label:o}) );
		return [{value:false, label: BLANK_VALUE}, ...options];
	}
	onNewOptionClick({value}){
		if(DEBUG) console.log("IsASelect._onNewOptionClick: "+value);

		this.justAdded = true;
		thingStore.add({name: value});
		this.props.addThing(value);
		this.props.handleChange("isa",value);

		if(this.select) this.select.blurInput();
	}
	handleChange({value}){
		if(DEBUG) console.log("IsASelect.handleChange -- "+value);

		// clear value and continue. Not null because can't inherit isa property
		if(value === this.props.thingName || value === false){
			value = undefined;
		}

		if(value === this.props.value) // no change
			return;
		
		if(value === null) // reset - clear to original
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
	
	render (){
		if(DEBUG) 
			console.log("-------  IsASelect RENDER "+this.props.value)
		if(DEBUG){
			console.log("* Acheron background: "+thingStore.get("Acheron").background);
		}

		const value = (this.props.value === undefined) ? BLANK_VALUE: this.props.value;
		const helpText = (this.justAdded) ? <span><i className="fa fa-check"/> added new thing <strong>{value}</strong></span> : "";
		
		return (
		<FormGroup validationState={this.props.status.isUpdated?"success":null} className={this.props.status.isEnabled ? "" : "fake-disabled"}>
			<label>Is a...</label>
			<Creatable name="isa" value={value} 
				onChange={this.handleChange}
				clearable={this.props.status.isClearable} clearValueText="Clear changes" resetValue={resetValue} 
				options={this.state.options} 
				clearRenderer={Styler.selectClear}
				onNewOptionClick={this.onNewOptionClick}
				promptTextCreator={promptCreateNew} 
				ref={(createable) => this.select = (createable) ? createable.select : null}
				shouldKeyDownEventCreateNewOption={_false} 
				onInputKeyDown={this.onInputKeyDown} />
			<HelpBlock>{helpText}</HelpBlock>
		</FormGroup>);
	} 
}

function promptCreateNew(label){
	return "Click here to create new thing \""+label+"\"";
}
function _false(){
	return false;
}