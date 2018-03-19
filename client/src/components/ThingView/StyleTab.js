import React from 'react'
import Select from 'react-select'

import Styler from '../../util/Styler';
import IconSelect from './IconSelect';

const RESET_VALUE = ",,"
const DEBUG = false;

export default class StyleTab extends React.Component{
	render(){
		const iconStatus = this.props.getStatus("icon");
		const bgStatus = this.props.getStatus("background");
		const txtStatus = this.props.getStatus("textColor");

		return(<div>
			<div className="row">
				<div class="col-md">
					<ColorDropdown label="Background" name="background" value={this.props.thing.background} status={bgStatus}
						saveProperty={this.props.handleChange} setPreview={this.props.setPreview} />
				</div>
				<div class="col-md">
					<ColorDropdown label="Text color" name="textColor" value={this.props.thing.textColor} status={txtStatus}
						saveProperty={this.props.handleChange} setPreview={this.props.setPreview} />
				</div>
			</div>
			<IconSelect value={this.props.thing.icon} status={iconStatus}
				saveProperty={this.props.handleChange} setPreview={this.props.setPreview}    /> 
		</div>)
	}
}

class ColorDropdown extends React.Component {
	constructor(){
		super();
		this.handleChange = this.handleChange.bind(this);
		this.handleClickValue = this.handleClickValue.bind(this);
	}
	handleChange(values){
		if(DEBUG) console.log("ColorDropdown.handleChange -- \""+values)

		if(values === RESET_VALUE){ //resetting
			if(DEBUG) console.log("\t resetting");
			this.props.saveProperty(this.props.name,null,true);
			return;
		}

		var value = values.split(",")

		if(value.length === 1){
			value = value[0];
		}

		if(value === undefined || value === "default" || value === "") //blank select
			value = null;

		this.props.saveProperty(this.props.name, value);
	}
	handleClickValue({value}){
		this.props.setPreview(this.props.name,value)
		console.log(value);
	}
	render (){
		const options = (this.props.name === "background") ? Styler.getBackgroundOptions(this.props.value)
			: Styler.getColorOptions(this.props.value);
		const value = (this.props.value) ? this.props.value : [];
		if(DEBUG){
			console.log("\t ColorDropdown.RENDER -- \""+value+"\"");
			console.log("\t\t "+this.props.name+" isUpdated:"+this.props.status.isUpdated+" isEnabled:"+this.props.status.isEnabled+" isClearable:"+this.props.status.isClearable);
		} 

		return (<div className={`form-group ${this.props.status.isEnabled ? "" : "fake-disabled"}`} 
					validationState={this.props.status.isUpdated ? "success" : null}>
				<label>{this.props.label}</label> 
				<Select.Creatable value={value} multi={true} 
					clearable={this.props.status.isClearable}
					clearValueText="Clear changes" clearRenderer={Styler.selectClear} resetValue={["","",""]} 
					simpleValue
					optionRenderer={Styler.renderColorOption}
					onChange={this.handleChange} onValueClick={this.handleClickValue}
					options={options} />
			</div>);
	}
}