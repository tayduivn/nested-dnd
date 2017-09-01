import React from 'react'
import Select from 'react-select'
import { FormGroup, Row, Col } from 'react-bootstrap';

import Styler from '../../util/Styler';
import IconSelect from './IconSelect';

const resetValue = {value:null, label:null}
const DEBUG = false;

export default class StyleTab extends React.Component{
	render(){
		const iconStatus = this.props.getStatus("icon");
		const bgStatus = this.props.getStatus("background");
		const txtStatus = this.props.getStatus("textColor");

		return(<div>
			<Row>
				<Col sm={12} md={6}>
					<ColorDropdown label="Background" name="background" value={this.props.thing.background} status={bgStatus}
						saveProperty={this.props.handleChange} />
				</Col>
				<Col sm={12} md={6}>
					<ColorDropdown label="Text color" name="textColor" value={this.props.thing.textColor} status={txtStatus}
						saveProperty={this.props.handleChange} />
				</Col>
			</Row>
			<IconSelect value={this.props.thing.icon} saveProperty={this.props.handleChange} status={iconStatus}  /> 
		</div>)
	}
}

class ColorDropdown extends React.Component {
	constructor(){
		super();
		this.handleChange = this.handleChange.bind(this);
	}
	handleChange({value, label}){
		if(DEBUG) console.log("ColorDropdown.handleChange -- \""+label+"\": "+value)

		if(value === null){ //resetting
			this.props.saveProperty(this.props.name,value,true);
			return;
		}
		if(value === undefined || value === "default" || value === "") //blank select
			value = null;

		this.props.saveProperty(this.props.name, value);
	}
	render (){
		const options = (this.props.name === "background") ? Styler.getBackgroundOptions(this.props.value)
			: Styler.getColorOptions(this.props.value);
		const value = (this.props.value) ? this.props.value : "default";
		if(DEBUG){
			console.log("\t ColorDropdown.RENDER -- \""+value+"\"");
			console.log("\t\t "+this.props.name+" isUpdated:"+this.props.status.isUpdated+" isEnabled:"+this.props.status.isEnabled+" isClearable:"+this.props.status.isClearable);
		} 

		return (<FormGroup className={this.props.status.isEnabled ? "" : "fake-disabled"} 
					validationState={this.props.status.isUpdated ? "success" : null}>
				<label>{this.props.label}</label>
				<Select.Creatable value={value} 
					clearable={this.props.status.isClearable}
					clearValueText="Clear changes" clearRenderer={Styler.selectClear}
					resetValue={resetValue}
					optionRenderer={Styler.renderColorOption}
					onChange={this.handleChange} 
					options={options} />
			</FormGroup>);
	}
}