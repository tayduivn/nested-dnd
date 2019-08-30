import React from "react";

import styles from "./Button.module.scss";

export function SubmitButton({ variant = "text", value, className = "", ...props }) {
	return (
		<input
			type="submit"
			className={`${styles.root} ${styles[variant]} ${className}`}
			value={value}
			{...props}
		/>
	);
}

export function CloseButton({ className, onClick, ...props }) {
	return (
		<Button variant="icon" className={className} {...props}>
			<i className="fas fa-times" />
		</Button>
	);
}

export default function Button({ variant = "text", children, className = "", ...props }) {
	return (
		<button className={`${styles.root} ${styles[variant]} ${className}`} {...props}>
			{children}
		</button>
	);
}
