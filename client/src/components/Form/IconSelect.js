import React, { memo } from "react";
import PropTypes from "prop-types";

import { areEqual } from "react-window";
import { Icon } from "../Explore/ExplorePage";
import iconOptions from "../../assets/icons.js";
import Dropdown from "./Dropdown";

import "./IconSelect.css";

const animations = [
	"spin",
	"spinReverse",
	"pulse",
	"flash",
	"headShake",
	"swing",
	"tada",
	"wobble",
	"jello",
	"rubberBand"
];

const animationOptions = [<option key="placeholder" value="" />].concat(
	animations.map(anim => (
		<option value={anim} key={anim}>
			{anim}
		</option>
	))
);

const Option = memo(
	({
		data: { matches, selected, clickEvent, handleClick, className },
		index,
		isScrolling,
		style
	}) => {
		const item = matches[index];
		const isSelected = item === selected ? `--selected` : "";

		if (!item) return null;
		return (
			<li
				className={`dropdown__option ${className}__option ${isSelected}`}
				data-value={item.value}
				data-label={item.label}
				style={style}
				{...{ [clickEvent]: handleClick }}
			>
				<Icon name={item.value} fadeIn={false} /> {item.label}
			</li>
		);
	},
	areEqual
);

class IconPreview extends React.PureComponent {
	render() {
		const { handleChangeAnim, animArr = [], index, icon, cssClass, style } = this.props;
		return (
			<div className="col icon-wrap" key={index}>
				<div className={"form-group icon " + cssClass} style={style} name={"icon" + index}>
					<label>
						<Icon name={icon + " " + animArr[index]} />
					</label>
					<select
						onChange={handleChangeAnim}
						value={animArr[index]}
						data-index={index}
						data-icon={icon}
					>
						{animationOptions}
					</select>
				</div>
			</div>
		);
	}
}

class IconSelectDisplay extends React.PureComponent {
	handleChange = v => {
		this.props.handleChange(v.isa, this.props.animArr);
	};
	_getSelectProps() {
		const { multi = false, iconArr = [] } = this.props;
		return {
			name: "icon",
			className: "iconDropdown",
			defaultValue: multi ? iconArr.label : iconArr[0].label,
			fixedOptions: iconOptions,
			onChange: this.handleChange,
			isClearable: false,
			isSearchable: true,
			isMulti: multi,
			rows: 1,
			limit: 300,
			itemHeight: 40, //px
			OptionComponent: Option
		};
	}
	render() {
		const { status = {}, validationState, iconArr = [] } = this.props;
		const { handleChangeAnim, animArr = [], cssClass, style } = this.props;
		return (
			<div className={status.isEnabled ? "" : "fake-disabled"}>
				<div className="row">
					<div className="col-md">
						<div validationstate={validationState} className="form-group">
							<Dropdown {...this._getSelectProps()} />
						</div>
					</div>
					<div id="icons-preview" className="col-md-auto row">
						{iconArr.map(({ label, value: icon }, index) => (
							<IconPreview
								key={index}
								{...{ handleChangeAnim, animArr, index, icon, cssClass, style }}
							/>
						))}
					</div>
				</div>
			</div>
		);
	}
}

class IconSelect extends React.Component {
	static propTypes = {
		multi: PropTypes.bool,
		setPreview: PropTypes.func,
		saveProperty: PropTypes.func
	};
	shouldComponentUpdate(nextProps) {
		let diffVal = typeof nextProps.value !== typeof this.props.value;
		if (diffVal) return true;

		if (typeof nextProps.value == "object") {
			diffVal = JSON.stringify(nextProps.value) !== JSON.stringify(this.props.value);
		} else {
			diffVal = nextProps.value !== this.props.value;
		}
		return diffVal || nextProps.status.isUpdated !== this.props.status.isUpdated;
	}
	handleChange = (value = [], animArr = []) => {
		var { iconArr, animArr: anims } = this._parseIconArr(this.props.value);
		animArr = animArr ? animArr : anims;

		if (value === null) {
			//reset!
			return this.props.saveProperty(null);
		}

		//value = value.map(v => v.value);

		//is delete, remove animArr option
		if (value.length < iconArr.length) {
			for (var i = 0; i < iconArr.length; i++) {
				if (!value.includes(iconArr[i])) {
					animArr.splice(i, 1);
				}
			}
		}

		// put the spin classes back into the values
		if (!value.map) {
			value = [value];
		}
		value = value.map((val, i) => (animArr[i] && animArr[i] !== "" ? val + " " + animArr[i] : val));

		//re-flatten
		if (value.length === 1) {
			value = this.props.multi ? { type: "string", value: value[0] } : value[0];
		} else {
			value = {
				type: "table",
				value: {
					rows: value.map(v => ({ value: v }))
				}
			};
		}
		if (value === "") value = null;

		return this.props.saveProperty(value);
	};
	handleChangeAnim = event => {
		var index = event.target.getAttribute("data-index");
		var anim = event.target.value;

		var { iconArr, animArr } = this._parseIconArr(this.props.value);

		animArr[index] = anim;
		this.handleChange(iconArr, animArr);
	};
	handleClickChosen = ({ value }) => {
		var { iconArr, animArr } = this._parseIconArr(this.props.value);
		var index = iconArr.indexOf(value);
		if (index !== -1) {
			value += " " + animArr[index];
		}
		this.props.setPreview("icon", value);
	};
	_parseIconArr(value) {
		var iconArr = [];
		var animArr = [];

		// todo: this shit is confuuusinggg
		if (value && value.value) {
			value = value.value.rows;
		}

		if (!value) {
			return { iconArr, animArr };
		} else if (typeof value === "string") {
			animArr = [findAnim(value)];
			iconArr = [replaceAnim(value, animArr[0])];
		} else if (value.type === "string") {
			value = value.value;
			animArr = [findAnim(value)];
			iconArr = [replaceAnim(value, animArr[0])];
		} else {
			//should be Array
			iconArr = value.map((val, index) => {
				animArr[index] = findAnim(val);
				return replaceAnim(val, animArr[index]);
			});
		}

		iconArr = iconArr.map(i => {
			var parts = i.split("/");
			return {
				label: parts[parts.length - 1],
				value: i
			};
		});
		return { iconArr, animArr };
	}
	render() {
		return (
			<IconSelectDisplay
				{...this._parseIconArr(this.props.value)}
				{...this}
				{...this.props}
				validationState={this.props.status.isUpdated ? "success" : null}
			/>
		);
	}
}

function findAnim(value) {
	value = " " + value + " ";

	var matches = value.match("^.*\\s(" + animations.join("|") + ")\\s.*$");
	if (matches && matches[1]) {
		return matches[1];
	}
}
function replaceAnim(value, anim) {
	var str = (" " + value + " ")
		.replace(/ animated /g, " ")
		.replace(/ infinite /g, " ")
		.replace(" " + anim + " ", " ")
		.trim();
	return str;
}

export default IconSelect;
export { IconSelectDisplay };
