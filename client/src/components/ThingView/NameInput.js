import React from "react";
import thingStore from "../../stores/thingStore";
import { FormGroup, FormControl, HelpBlock, Glyphicon } from "react-bootstrap";

const DEBUG = false;

export default class NameInput extends React.Component {
	constructor() {
		super();
		this.handleChange = this.handleChange.bind(this);
		this.handleClear = this.handleClear.bind(this);
	}
	shouldComponentUpdate(nextProps) {
		if (DEBUG) {
			console.log(
				"* Acheron background: " + thingStore.get("Acheron").background
			);
		}
		return !Object.values(this.props).equals(Object.values(nextProps));
	}
	componentWillUpdate(nextProps) {
		this._validate(nextProps);
	}
	handleChange(e) {
		this.props.handleChange("name", e.currentTarget.value);
	}
	handleClear() {
		this.props.handleChange("name", this.props.originalValue, true);
	}
	_validate(props) {
		if (DEBUG) console.log("NameInput._validate");

		this.validationState = props.isUpdated ? "success" : null;
		this.helpText = "";

		if (!props.value || props.value.trim().length === 0) {
			this.validationState = "error";
			this.helpText = "Name is required";
		} else if (props.isUpdated) {
			if (thingStore.exists(props.value.trim())) {
				this.validationState = "error";
				this.helpText = (
					<span>
						<strong>{props.value}</strong> already exists
					</span>
				);
			} else if (props.originalValue.trim().length) {
				this.helpText = (
					<span>
						renaming <strong>{props.originalValue}</strong> to{" "}
						<strong>{props.value}</strong>
					</span>
				);
			} else {
				this.helpText = (
					<span>
						adding new thing <strong>{props.value}</strong>
					</span>
				);
			}
		}
		if (DEBUG) console.log("\t\t " + this.validationState);

		if (this.validationState === "error") {
			this.props.validate("name", this.validationState);
		}
	}
	render() {
		return (
			<FormGroup
				className="title clearable"
				bsSize="large"
				controlId="thing-name"
				validationState={this.validationState}
			>
				<FormControl
					type="text"
					value={this.props.value}
					onChange={this.handleChange}
				/>
				<HelpBlock>
					{this.helpText}
				</HelpBlock>
				<FormControl.Feedback
					className={
						this.props.value === this.props.originalValue
							? "hidden"
							: ""
					}
					onClick={this.handleClear}
				>
					<Glyphicon glyph="remove" />
				</FormControl.Feedback>
			</FormGroup>
		);
	}
}
