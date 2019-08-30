import React, { useState, useCallback } from "react";

import styles from "./ImageExpand.module.scss";

export default function ImageExpand({ alt = "", className, ...props }) {
	const [expanded, setExpanded] = useState(false);

	const toggleExpanded = useCallback(() => {
		setExpanded(!expanded);
	}, [expanded]);

	return (
		<img
			className={`${styles.img} ${expanded ? styles.expanded : ""} ${className}`}
			alt={alt}
			{...props}
			onClick={toggleExpanded}
		></img>
	);
}
