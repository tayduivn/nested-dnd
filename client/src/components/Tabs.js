import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";

import toUpper from "util/toUpper";

const NavItem = ({ label, active }) => (
	<li className="nav-item">
		<Link
			className={`nav-link ${active === label ? "active" : ""}`}
			id={`${label}-tab`}
			to={"#" + label}
			aria-controls={label}
			aria-selected={active === label}
			data-label={label}
			role="tab"
		>
			{toUpper(label)}
		</Link>
	</li>
);

const Pane = ({ label, active, children }) => (
	<div
		className={`tab-pane fade ${active === label ? "show active" : ""}`}
		id={label}
		role="tabpanel"
		aria-labelledby={`${label}-tab`}
	>
		<h2>{toUpper(label)}</h2>
		{children}
	</div>
);

const Tabs = ({ labels = [], active, children }) => {
	const [activeTab, setActiveTab] = useState(active);

	const handleClickTab = useCallback(
		e => {
			setActiveTab(e.target.dataset.label);
		},
		[setActiveTab]
	);

	return (
		<React.Fragment>
			<ul className="nav nav-tabs" role="tablist" onClick={handleClickTab}>
				{labels.map(l => (
					<NavItem key={l} label={l} active={activeTab} />
				))}
			</ul>

			<div className="tab-content">
				{children.map((child, i) => (
					<Tabs.Pane key={i} label={labels[i]} active={activeTab}>
						{child}
					</Tabs.Pane>
				))}
			</div>
		</React.Fragment>
	);
};

Tabs.Pane = Pane;

export default Tabs;
