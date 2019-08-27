import React from "react";
import { Link as L } from "react-router-dom";

class Link extends React.Component {
	shouldComponentUpdate(nextProps) {
		return (
			JSON.stringify(this.props.to) !== JSON.stringify(nextProps.to) ||
			this.props.title !== nextProps.title ||
			this.props.className !== nextProps.className ||
			this.props.children !== nextProps.children
		);
	}

	render() {
		return (
			<L to={this.props.to} title={this.props.title} className={this.props.className}>
				{this.props.children}
			</L>
		);
	}
}

export default Link;
