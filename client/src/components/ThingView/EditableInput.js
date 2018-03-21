import React from "react";

const DEBUG = false;

class EditableInput extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			showHelp: false
		};

		// this is always the same, so we can set it in the contstructor
		this.defaultHelp = props.defaultHelpText ? props.defaultHelpText : "";

		this.validationState = null;
		this.helpText = this.defaultHelp;

		this.handleClear = this.handleClear.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.onFocus = this.onFocus.bind(this);
	}
	shouldComponentUpdate(nextProps, nextState) {
		const changed =
			this._changedProps(nextProps) ||
			!Object.values(this.state).equals(Object.values(nextState));

		if (DEBUG)
			console.log("\t EditableInput.shouldComponentUpdate: " + changed);
		return changed;
	}
	componentWillUpdate(nextProps) {
		if (DEBUG) console.log("\t EditableInput.componentWillUpdate");
		this._validate(nextProps);
	}
	_changedProps(nextProps) {
		return (
			this.props.value !== nextProps.value ||
			this.props.status.isUpdated !== nextProps.status.isUpdated
		);
	}
	handleChange(event) {
		if (DEBUG) console.log("\t EditableInput.handleChange");
		var property = event.currentTarget.name;
		var value = event.currentTarget.value;

		// convert to JSON in ThingView.handleSave

		this.props.handleChange(property, value);
	}
	handleClear(event) {
		var input = event.currentTarget.previousSibling;
		var property = input.getAttribute("name");
		if (DEBUG) console.log("\t EditableInput.handleClear " + property);

		this.props.handleChange(property, undefined, true);
	}
	onBlur() {
		if (DEBUG) console.log("\t EditableInput.onBlur");
		this.setState({ showHelp: false });
	}
	onFocus() {
		if (DEBUG) console.log("\t EditableInput.onFocus");
		this.setState({ showHelp: true });
	}

	_validate(props) {
		if (DEBUG) console.log("\t EditableInput._validate");

		this.validationState = null;
		this.helpText = this.defaultHelp;

		var okArrayText = (
			<span>
				<i className="fa fa-check" /> valid array format
			</span>
		);
		var okJSONText = (
			<span>
				<i className="fa fa-check" /> valid JSON format
			</span>
		);
		var badJSONText = (
			<span>
				<i className="fa fa-exclamation" /> invalid JSON format
			</span>
		);

		if (props.status.isUpdated) {
			//will always be a string
			this.validationState = "success";

			try {
				JSON.parse(props.value);
				this.helpText = okJSONText;
			} catch (e) {
				if (props.isJSON) {
					this.helpText = badJSONText;
					this.validationState = "error";
				}
			}
		} else {
			//not edited, may have been converted
			if (props.value.constructor.name === "Array") {
				this.helpText = okArrayText;
			} else if (typeof props.value === "object") {
				this.helpText = okJSONText;
			}
		}

		if (this.validationState === "error")
			props.validate("namegen", this.validationState);
	}

	render() {
		if (DEBUG) console.log("---- EditableInput.RENDER");
		const value = this.props.value;
		const rows = value.split(/\r\n|\r|\n/).length;

		return (
			<div
				validationstate={this.validationState}
				className={`form-group ${
													this.props.status.isClearable
														? "clearable"
														: "not-clearable"
												}`}
			>
				<label>
					{this.props.label}
				</label>
				<div
					className={
						"input-group no-input-addons " +
						(this.props.status.isEnabled ? "" : "fake-disabled")
					}
				>
					<div
						componentclass="textarea"
						value={value}
						rows={rows}
						name={this.props.property}
						onChange={this.handleChange}
						onFocus={this.onFocus}
						onBlur={this.onBlur}
					/>
					<div className="feedback" onClick={this.handleClear}>
						<i className="fa fa-" />
					</div>
				</div>
				<small className={this.state.showHelp ? "" : "hidden"}>
					{this.helpText}
				</small>
			</div>
		);
	}
}

export default EditableInput;
