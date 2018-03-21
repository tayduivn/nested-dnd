import React from "react";

const DEBUG = false;

export default class NameInput extends React.Component {
	constructor() {
		super();
		this.handleChange = this.handleChange.bind(this);
		this.handleClear = this.handleClear.bind(this);
	}
	shouldComponentUpdate(nextProps) {
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
			if (true) { //thingStore.exists(props.value.trim())
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
			<div
				className="form-group title clearable"
				bssize="large"
				name="thing-name"
				validationstate={this.validationState}
			>
				<input
					type="text"
					value={this.props.value}
					onChange={this.handleChange}
				/>
				<small>
					{this.helpText}
				</small>
				<div className={`valid-feedback ${
														this.props.value === this.props.originalValue
															? "hidden"
															: ""
													}`}
					onClick={this.handleClear}
				>
					<i className="fa fa-cross" />
				</div>
			</div>
		);
	}
}
