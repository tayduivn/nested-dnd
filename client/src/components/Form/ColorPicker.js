import React from "react";
import debounce from "debounce";
import { CustomPicker } from "react-color";

import colors, { colorOrder } from "../../colors";

import "./ColorPicker.css";

function validTextColour(stringToTest) {
	//Alter the following conditions according to your need.
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

const ColorPicker = ({ cn, hex }) => (
	<div className="colorPicker">
		{colorOrder.map((name, i) => (
			<div key={i} className="row no-gutters">
				{Object.keys(colors[name]).map((variant, j) => (
					<div
						key={j}
						className={
							"col sample " +
							(cn = "bg-" + name + "-" + variant) +
							(colors[name][variant].toUpperCase() ===
							(hex && hex.toUpperCase())
								? " selected"
								: "")
						}
						data-class={cn}
						data-hex={colors[name][variant]}
					/>
				))}
				{Array(15 - Object.keys(colors[name]).length)
					.fill(null)
					.map((h, k) => (
						<div key={k} className="col sample">
							&nbsp;
						</div>
					))}
			</div>
		))}
	</div>
);

class HexColorPicker extends React.Component {
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

	handleClick = e => {
		var hex = e.target.dataset.hex;

		if (hex && validTextColour(hex)) {
			this.props.handleChange(this.props.index, "txt", hex);
			this.setState({ color: hex });
		} else if (e.target.id === "clearColor") {
			this.props.handleChange(this.props.index, "txt", null);
			document.body.style.color = "";
			this.setState({ color: this.props.getTextColor() });
		}
	};

	handleType = e => {
		var hex = e.target.value;
		if (validTextColour(hex)) {
			this.props.handleChange(this.props.index, "txt", hex);
		}
		this.setState({ color: hex });
	};

	render() {
		const popover = {
			position: "absolute",
			zIndex: "2"
		};

		return (
			<div id="txtOptions" tabIndex="0" ref={this.ref}>
				<button
					className={"btn txt " + this.props.cssClass}
					onClick={this.handleOpen}
					type="button"
				>
					<div className={`txt swatch`} />
				</button>
				{this.state.display ? (
					<div
						className="popover animated fadeIn"
						role="tooltip"
						style={popover}
						onClick={this.handleClick}
					>
						<div className="arrow" />
						<div className="popover-body form-inline">
							<input
								id="txtInput"
								className="form-control mb-1"
								value={this.state.color}
								onChange={debounce(this.handleType, 500)}
							/>
							{this.props.txt ? (
								<button id="clearColor" className="btn btn-default">
									<i className="fa fa-times" /> use default
								</button>
							) : null}
							<ColorPicker {...this.props} hex={this.props.hex} />
						</div>
					</div>
				) : null}
				{this.state.display ? (
					<div className="popover-cover" onClick={this.handleClose} />
				) : null}
			</div>
		);
	}
}

HexColorPicker = CustomPicker(HexColorPicker);

export { ColorPicker, HexColorPicker };
