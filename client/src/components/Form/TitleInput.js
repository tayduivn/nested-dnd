import React from "react";
import PropTypes from "prop-types";
import debounce from "debounce";

const DEBOUNCE_DEFAULT = 1000; //ms

export default class TitleInput extends React.Component {
	static propTypes = {
		value: PropTypes.string,
		handleChange: PropTypes.func,
		name: PropTypes.string,
		placeholder: PropTypes.string,
		autoFocus: PropTypes.bool,
		required: PropTypes.bool
	};

	static defaultProps = {
		handleChange: () => {}
	};
	// we need to use key="" on this or a parent so it gets re-created if the object changes
	constructor(props) {
		super(props);
		this.state = {
			value: props.value + ""
		};
		this.handleChange = this.handleChange.bind(this);
		this.doSave = debounce(props.handleChange, DEBOUNCE_DEFAULT);
	}

	handleChange(e) {
		const newValue = e.target.value;
		this.setState({ value: newValue });
		// save to DB
		this.doSave({ [this.props.name]: newValue });
	}

	render() {
		return (
			<input
				type="text"
				className="input-title"
				name={this.props.name}
				value={this.state.value}
				placeholder={this.props.placeholder}
				onChange={this.handleChange}
				required={this.props.required}
				autoFocus={this.props.autoFocus}
			/>
		);
	}
}
