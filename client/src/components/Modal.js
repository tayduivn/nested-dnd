import React from "react";
import PropTypes from "prop-types";

import styles from "./Modal.module.scss";

const NOOP = () => {};
function stopPropagation(e) {
	e.stopPropagation();
}

function Dialog({ children }) {
	return (
		<div className={styles.dialog} onMouseDown={stopPropagation} role="dialog">
			{children}
		</div>
	);
}

function Select({ children, ...props }) {
	return (
		<select className={styles.select} {...props}>
			{children}
		</select>
	);
}

function Header({ children, ...props }) {
	return (
		<header className={styles.header} {...props}>
			<h1>{children}</h1>
		</header>
	);
}

function Body({ children, ...props }) {
	return (
		<section className={styles.body} {...props}>
			{children}
		</section>
	);
}

function Footer({ children, ...props }) {
	return (
		<footer className={styles.footer} {...props}>
			{children}
		</footer>
	);
}

export default function Modal({ onClose = NOOP, children = null, scroll = false, size, ...props }) {
	// we need to use onMouseDown, so if the user clicks on the dialog but off on the screen,
	// it doesn't close
	return (
		<div
			className={`${styles.overlay} ${scroll ? styles.scroll : ""} ${styles[size]}`}
			onMouseDown={onClose}
			{...props}
		>
			<Dialog onClose={onClose}>{children}</Dialog>
		</div>
	);
}

Modal.propTypes = {
	onClose: PropTypes.func.isRequired,
	scroll: PropTypes.bool,
	size: PropTypes.string
};

Modal.Header = Header;
Modal.Body = Body;
Modal.Footer = Footer;
Modal.Select = Select;
