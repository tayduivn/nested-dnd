import React from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types'

import { Icon } from '../Explore/ExplorePage'
import iconOptions from '../../assets/icons.js'
import { MenuList } from './IsASelect';

import './IconSelect.css';

const DEBUG = false;

const animations = ["spin","spinReverse","pulse","flash","headShake","swing","tada","wobble","jello","rubberBand"]

const animationOptions = [<option key="placeholder" value=""></option>]
	.concat(animations.map((anim) => <option value={anim} key={anim}>{anim}</option>))

const Option = ({innerRef, innerProps, label, value}) => {
	return	<div className="icon-option" ref={innerRef} {...innerProps}>
		<Icon name={value} fadeIn={false}  /> {label}
	</div>
}

const IconSelectDisplay = ({status = {}, validationState, iconArr = [], virtualSelect, handleChange, handleChangeAnim, handleClickChosen, animArr= [], multi = false, cssClass, style }) => (
	<div className={status.isEnabled ? "" : "fake-disabled"}>
		<div className="row">
			<div className="col-md">
				<div validationstate={validationState} className="form-group">
					<Select 
						name="icon" 
						components={{ MenuList, Option }} 
						defaultValue={multi ? iconArr : iconArr[0] } 
						options={iconOptions} 
						onChange={(v)=>handleChange(multi ? v : [v], animArr)}
						isClearable={false} 
						isMulti={multi} />
				</div>
			</div>
			<div id="icons-preview" className="col-md-auto row">
				{iconArr.map(({label, value: icon}, index) => (
				<div className="col icon-wrap" key={index} >
					<div className={"form-group icon "+cssClass} style={style} name={"icon"+index}>
						<label>
							<Icon name={icon+" "+animArr[index]} />
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
	static propTypes = {
		setPreview: PropTypes.func,
		saveProperty: PropTypes.func
	}
	constructor(){
		super();
		this.handleChange = this.handleChange.bind(this);
		this.handleChangeAnim = this.handleChangeAnim.bind(this);
		this.handleClickChosen = this.handleClickChosen.bind(this);
	}
	shouldComponentUpdate(nextProps){
		return (nextProps.value !== this.props.value || nextProps.status.isUpdated !== this.props.status.isUpdated );
	}
	handleChange(value = [], animArr = []){
		var { iconArr, animArr: anims } = this._parseIconArr(this.props.value);
		animArr = (animArr) ? animArr : anims;

		if(value === null){ //reset!
			return this.props.saveProperty(null);
		}

		value = value.map(v=>v.value);

		//is delete, remove animArr option
		if(value.length < iconArr.length){
			if(DEBUG) console.log("\t\t\t was deletion ");
			for(var i = 0; i < iconArr.length; i++){
				if(!value.includes(iconArr[i])){
					animArr.splice(i,1);
					if(DEBUG) console.log("\t\t\t removed option "+(i+1));
				}
			}
		}

		// put the spin classes back into the values
		value = value.map((val,i) => 
			(animArr[i] && animArr[i] !== "") ? (val+" "+animArr[i]) : val
		);

		//re-flatten
		if(value.length === 1){
			value = (this.props.multi) ? {type: 'string',value: value[0]} : value[0];
		} 
		else{
			value = {
				type: 'table',
				value: {
					rows: value.map(v=>({value: v}))
				} 
			}
		}
		if(value === "") value = null;

		if(DEBUG) console.log("\t\t\t save icon: "+value);
		return this.props.saveProperty(value);
	}
	handleChangeAnim(event){
		var index = event.target.getAttribute("data-index");
		var anim = event.target.value;

		var { iconArr, animArr } = this._parseIconArr(this.props.value);

		animArr[index] = anim;
		this.handleChange(iconArr, animArr);
	}
	handleClickChosen({value}){
		var { iconArr, animArr } = this._parseIconArr(this.props.value)
		var index = iconArr.indexOf(value);
		if(index !== -1){
			value+= " "+animArr[index]
		}
		this.props.setPreview("icon",value);
	}
	_parseIconArr(value){
		var iconArr = [];
		var animArr = [];

		if(!value){
			return {iconArr, animArr};
		} 
		else if(typeof value === "string"){
			animArr = [findAnim(value)];
			iconArr = [replaceAnim(value, animArr[0])];
		}
		else if(value.type === "string"){
			value = value.value;
			animArr = [findAnim(value)];
			iconArr = [replaceAnim(value, animArr[0])];
		}
		else{ //should be Array
			iconArr = value.map((val, index) => {
				animArr[index] = findAnim(val);
				return replaceAnim(val, animArr[index]);
			});
		}

		iconArr = iconArr.map(i=>{
			var parts = i.split('/');
			return {
				label: parts[parts.length-1],
				value: i
			}
		})
		return { iconArr, animArr };
	}
	render(){
		return <IconSelectDisplay {...this._parseIconArr(this.props.value)} {...this}  {...this.props} 
			validationState={this.props.status.isUpdated ? "success" : null} />
	}
}


function findAnim(value){
	value = " "+value+" ";

	var matches = value.match("^.*\\s("+animations.join("|")+")\\s.*$");
	if(matches && matches[1]){
		if(DEBUG) console.log("\t\t IconSelect.findAnim -- "+value+": "+matches[1])
		return matches[1];
	}
}
function replaceAnim(value, anim){
	var str = (" "+value+" ").replace(/ animated /g," ").replace(/ infinite /g," ").replace(" "+anim+" "," ").trim();
	if(DEBUG && anim) console.log("\t\t IconSelect.replaceAnim -- "+value+": "+str)
	return str;
}

export default IconSelect;
export { IconSelectDisplay };