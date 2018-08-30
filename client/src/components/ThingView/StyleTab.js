import React from 'react'
import { Creatable } from 'react-select'

import Styler from '../../util/Styler';
import IconSelect from '../Form/IconSelect';

const RESET_VALUE = ",,"
const DEBUG = false;


const StyleTab = (props) => (
	<div>
		<div className="row">
			<Dropdown label="Background" name="background" {...props} status={props.getStatus("background")} />
			<Dropdown label="Text color" name="textColor" {...props} status={props.getStatus("textColor")} />
		</div>
		<IconSelect value={props.thing.icon} status={props.getStatus("icon")}
			saveProperty={props.handleChange} setPreview={props.setPreview}    /> 
	</div>
)
export default StyleTab;

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

		return (
			<div className={`form-group ${this.props.status.isEnabled ? "" : "fake-disabled"}`} 
					validationstate={this.props.status.isUpdated ? "success" : null}>
				<label>{this.props.label}</label> 
				<Creatable value={value} multi={true} 
					clearable={this.props.status.isClearable}
					clearValueText="Clear changes" clearRenderer={Styler.selectClear} resetValue={["","",""]} 
					simpleValue
					optionRenderer={Styler.renderColorOption}
					onChange={this.handleChange} onValueClick={this.handleClickValue}
					options={options} />
			</div>);
	}
}

const Dropdown = ({label = "", name = "", thing = {}, status = "", handleChange = ()=>{}, setPreview = ()=>{} }) => (
	<div className="col-md">
		<ColorDropdown label={label} name={name} value={thing[name]} status={status}
			saveProperty={handleChange} setPreview={setPreview} />
	</div>
);