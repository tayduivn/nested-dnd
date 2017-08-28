import React from 'react';
import Select from 'react-select';
import VirtualizedSelect from 'react-virtualized-select'


class IconSelect extends React.Component{
	render(){
		return (<VirtualizedSelect name="icon" value={this.props.value} 
			clearable={true} clearValueText="Clear changes" 
			resetValue={ [ { value: this.props.resetValue, label: makeLabel(this.props.resetValue) } ] }
			onChange={this.props.onChange} 
			multi={true} matchProp="label" ignoreCase={false}
			optionRenderer={renderIcon} simpleValue searchable={true}  
			options={ this.props.options } 
			selectComponent={Select.Creatable} />)
	}
	/* DEPRECATED. TODO: replace by handling fa-spin */
	getIconsOptions(str){
		if(typeof str === "string"){
			var allOptions = this.state.iconsOptions.map((o) => o.value);
			if(!allOptions.includes(str)){
				this.state.iconsOptions.push({
					value: str,
					label: makeLabel(str)
				})
			}
		}
		return this.state.iconsOptions;
	}
}

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
	if(str.constructor.name === "Array"){
		return str.map((s)=>replace(s));
	}
	return replace(str);
	function replace(str){
		return str.replace(/-/g," ").replace(/gi gi /g,"").replace(/fa fa /g,"").replace(/fa flaticon /g,"").replace(/fa spin/g,"spin")
	}
}

export default IconSelect;