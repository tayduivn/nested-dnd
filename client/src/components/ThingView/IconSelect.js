import React from 'react';
import VirtualizedSelect from 'react-virtualized-select'

import iconStore from '../../stores/iconStore';
import Styler from '../../util/Styler';

const DEBUG = false;

const animations = ["spin","spinReverse","pulse","flash","headShake","swing","tada","wobble","jello","rubberBand"]

const animationOptions = [<option key="placeholder" value=""></option>]
	.concat(animations.map((anim) => <option value={anim} key={anim}>{anim}</option>))

const IconSelectDisplay = ({status, validationState, iconArr, virtualSelect, handleChange, handleChangeAnim, handleClickChosen, animArr, renderIcon}) => (
	<div className={status.isEnabled ? "" : "fake-disabled"}>
		<div className="form-group m-0" validationstate={validationState}>
			<label>Icon</label>
		</div>
		<div className="row">
			<div className="col-md">
				<div validationstate={validationState} className="form-group">
					<VirtualizedSelect name="icon" value={iconArr} simpleValue
						onChange={handleChange}
						clearable={status.isClearable} 
						clearAllText="Clear changes" clearRenderer={Styler.selectClear} resetValue={null}
						ref={(select) => virtualSelect = select }
						optionRenderer={renderIcon} options={ iconStore.iconOptions }
						onValueClick={handleClickChosen}
						multi={true} matchProp="label" ignoreCase={false} searchable={true}  />
				</div>
			</div>
			<div id="icons-preview" className="col-md row">
				{iconArr.map((icon, index) => (
				<div className="col-sm-4 icon-wrap" key={index} >
					<div className="form-group icon" name={"icon"+index}>
						<label>
							<i className={icon+" "+animArr[index]+" animated infinite"} title={icon} />
						</label>
						<select onChange={handleChangeAnim}
							value={animArr[index]} data-index={index} data-icon={icon}>
							{animationOptions}
						</select>
					</div>
				</div>
				) )}
			</div>
		</div>
	</div>
);

class IconSelect extends React.Component{
	constructor(){
		super();
		this.handleChange = this.handleChange.bind(this);
		this.handleChangeAnim = this.handleChangeAnim.bind(this);
		this.handleClickChosen = this.handleClickChosen.bind(this);

		this.iconArr = [];
	}
	shouldComponentUpdate(nextProps){
		return (nextProps.value !== this.props.value || nextProps.status.isUpdated !== this.props.status.isUpdated );
	}
	handleChange(value){
		if(DEBUG) console.log("\t\t IconSelect.handleChange: "+value);

		if(value === null){ //reset!
			return this.props.saveProperty("icon",null,true);
		}

		value = value.split(",");

		//is delete, remove animArr option
		if(value.length < this.iconArr.length){
			if(DEBUG) console.log("\t\t\t was deletion ");
			for(var i = 0; i < this.iconArr.length; i++){
				if(!value.includes(this.iconArr[i])){
					this.animArr.splice(i,1);
					if(DEBUG) console.log("\t\t\t removed option "+(i+1));
				}
			}
		}

		// put the spin classes back into the values
		value = value.map((val,i) => 
			(this.animArr[i] && this.animArr[i] !== "") ? (val+" "+this.animArr[i]+" animated infinite") : val
		);

		//re-flatten
		if(value.length === 1) value = value[0];
		if(value === "") value = null;

		if(DEBUG) console.log("\t\t\t save icon: "+value);
		this.props.saveProperty("icon",value);
	}
	handleChangeAnim(event){
		var index = event.target.getAttribute("data-index");
		var anim = event.target.value;
		if(DEBUG) console.log("\t\t IconSelect.handleChangeSpin: "+index+"  "+anim);

		this.animArr[index] = anim;
		this.handleChange(this.iconArr.join(","));
	}
	handleClickChosen({value}){
		var index = this.iconArr.indexOf(value);
		if(index !== -1){
			value+= " "+this.animArr[index]+" animated infinite"
		}
		this.props.setPreview("icon",value);
	}
	_parseIconArr(value){
		this.iconArr = [];
		var animArr = this.animArr = [];

		if(!value){
			return;
		} 
		else if(typeof value === "string"){
			this.animArr = [findAnim(value)];
			this.iconArr = [replaceAnim(value, this.animArr[0])];
		}
		else{ //should be Array
			this.iconArr = value.map((val, index) => {
				animArr[index] = findAnim(val);
				return replaceAnim(val, animArr[index]);
			});
		}
		if(DEBUG) {
			console.log("\t\t IconSelect._parseIconArr: \""+value+"\"");
			console.log("\t\t\t iconArr: "+JSON.stringify(this.iconArr));
			console.log("\t\t\t animArr: "+JSON.stringify(this.animArr));
		}
	}
	render(){
		if(DEBUG) console.log("-------- IconSelect RENDER");

		this._parseIconArr(this.props.value);
		const validationState = this.props.status.isUpdated ? "success" : null;

		return <IconSelectDisplay  {...this}  {...this.props} validationState={validationState} />
	}
}



function findAnim(value){
	value = " "+value+" ";

	if(value.includes(" animated ") && value.includes(" infinite ")){
		var matches = value.match("^.*\\s("+animations.join("|")+")\\s.*$");
		if(matches && matches[1]){
			if(DEBUG) console.log("\t\t IconSelect.findAnim -- "+value+": "+matches[1])
			return matches[1];
		}
	}
	return ""
}
function replaceAnim(value, anim){
	var str = (" "+value+" ").replace(/ animated /g," ").replace(/ infinite /g," ").replace(" "+anim+" "," ").trim();
	if(DEBUG && anim) console.log("\t\t IconSelect.replaceAnim -- "+value+": "+str)
	return str;
}

function renderIcon({ focusedOption, focusedOptionIndex, focusOption, key, labelKey, option, options, optionIndex, selectValue, style, valueArray }) {
	return (
		<div id={"icon-option-"+optionIndex} className={"icon-option "+((focusedOption.value === option.value) ? "is-focused" : "")} key={key}
			onClick={() => selectValue(option)}
			onMouseOver={() => focusOption(option)}
			style={style}
		><i className={option.value}/> {option.label}</div>
	)
}

/*
const spinCheckBox = (<Checkbox data-index={index} data-icon={icon} checked={this.animArr[index]} 
							onChange={this.handleChangeSpin} inline>
							<i className={icon + (this.animArr[index] ? " fa-spin" : "") } />
							<br />
							<span>spin</span>
						</Checkbox>)
*/
export default IconSelect;