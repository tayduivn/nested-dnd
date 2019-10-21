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
		const { to, title, className, children, ...rest } = this.props;
		return (
			<L to={to} title={title} className={className} {...rest}>
				{children}
			</L>
		);
	}
}

export default Link;
