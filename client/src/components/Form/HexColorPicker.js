import React from "react";
import PropTypes from "prop-types";
import { CustomPicker } from "react-color";
import debounce from "debounce";

import ColorPicker from "./ColorPicker";

/*function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function getTextColor() {
	var arr = document.body.style.color;
	if (!arr) return;

	arr = arr
		.replace("rgb(", "")
		.replace(")", "")
		.split(", ")
		.map(n => parseInt(n, 10));

	return rgbToHex(arr[0], arr[1], arr[2]);
}*/

function validTextColour(stringToTest) {
	// Alter the following conditions according to your need.
	if (stringToTest === "") {
		return false;
	}
	if (stringToTest === "inherit") {
		return false;
	}
	if (stringToTest === "transparent") {
		return false;
	}

	var image = document.createElement("img");
	image.style.color = "rgb(0, 0, 0)";
	image.style.color = stringToTest;
	if (image.style.color !== "rgb(0, 0, 0)") {
		return true;
	}
	image.style.color = "rgb(255, 255, 255)";
	image.style.color = stringToTest;
	return image.style.color !== "rgb(255, 255, 255)";
}

// testing
const Popover = ({ popover, handleClick, handleType, color }) => (
	<div className="popover animated fadeIn" role="tooltip" style={popover} onClick={handleClick}>
		<div className="arrow" />
		<div className="popover-body form-inline">
			<input
				id="txtInput"
				className="form-control mb-1"
				value={color}
				onChange={debounce(handleType, 500)}
			/>
			{color ? (
				<div id="clearColor" className="btn btn-default">
					<i className="fa fa-times" /> use default
				</div>
			) : null}
			<ColorPicker hex={color} />
		</div>
	</div>
);

const HexColorPickerDisplay = ({ children, handleOpen, ref, cls }) => (
	<button id="txtOptions" className={`title__btn ${cls}`} tabIndex="0" ref={ref}>
		<div className={"txt"} onClick={handleOpen} type="button">
			<div className={`txt swatch`} />
		</div>
		{children}
	</button>
);

class HexColorPicker extends React.Component {
	static propTypes = {
		hex: PropTypes.string
	};

	constructor(props) {
		super(props);
		this.state = {
			display: false,
			color: props.hex
		};
	}

	handleOpen = () => {
		this.setState({ display: true, color: this.props.hex });
	};

	handleClose = () => {
		this.setState({ display: false });
	};

	// handle click anywhere on the popover
	handleClick = e => {
		var hex = e.target.dataset.hex;

		if (hex && validTextColour(hex)) {
			this.sendChange(hex);
			this.setState({ color: hex });
		} else if (e.target.id === "clearColor") {
			this.sendChange(null);
			// document.body.style.color = "";
			this.setState({ color: this.props.hex });
		}
	};

	sendChange(value) {
		this.props.handleChange({ txt: value });
	}

	handleType = e => {
		var hex = e.target.value;
		if (validTextColour(hex)) {
			this.sendChange(hex);
		}
		this.setState({ color: hex });
	};

	render() {
		const popover = {
			position: "absolute",
			zIndex: "2"
		};
		const { handleOpen, ref, handleClick } = this;
		const { cls, txt, handleType } = this.props;
		const { color } = this.state;

		return (
			<HexColorPickerDisplay {...{ handleOpen, ref, cls }}>
				{this.state.display && <Popover {...{ popover, txt, color, handleType, handleClick }} />}
				{this.state.display && <div className="popover-cover" onClick={this.handleClose} />}
			</HexColorPickerDisplay>
		);
	}
}

export default CustomPicker(HexColorPicker);

export { HexColorPicker };
