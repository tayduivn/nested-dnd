import React from "react";

const Alert = ({ children, type = "danger", className = "" }) => {
	if (!children) return null;

	return (
		<div class={`alert alert-${type} alert-dismissible fade show ${className}`} role="alert">
			{children}
		</div>
	);
};

export default Alert;
