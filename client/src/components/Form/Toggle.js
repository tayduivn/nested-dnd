import React from "react";
import PropTypes from "prop-types";

export default class Toggle extends React.Component {
	static propTypes = {
		checked: PropTypes.bool,
		handleChange: PropTypes.func,
		name: PropTypes.string
	};
	// we need to use key="" on this or a parent so it gets re-created if the object changes
	constructor(props) {
		super(props);
		this.state = {
			checked: !!props.checked
		};
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(e) {
		this.setState({ checked: e.target.checked });
		this.props.handleChange({ [this.props.name]: e.target.checked });
	}

	render() {
		return (
			<label>
				<div className="switch">
					<input
						type="checkbox"
						className="switch-input"
						checked={this.state.checked}
						name={this.props.name}
						onChange={this.handleChange}
					/>
					<span className="switch-label" data-on="On" data-off="Off" />
					<span className="switch-handle" />
				</div>

				{this.props.children}
			</label>
		);
	}
}
