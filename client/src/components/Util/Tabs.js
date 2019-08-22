import React from "react";

import { toUpper } from "../../util";

const NavItem = ({ label, active }) => (
	<li className="nav-item">
		<a
			className={`nav-link ${active === label ? "active" : ""}`}
			id={`${label}-tab`}
			href={"#" + label}
			data-toggle="tab"
			aria-controls={label}
			aria-selected={active === label}
			role="tab"
		>
			{toUpper(label)}
		</a>
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

const Tabs = ({ labels = [], active, children }) => (
	<React.Fragment>
		<ul className="nav nav-tabs" role="tablist">
			{labels.map(l => (
				<NavItem key={l} label={l} active={active} />
			))}
		</ul>

		<div className="tab-content">{children}</div>
	</React.Fragment>
);

Tabs.Pane = Pane;

export default Tabs;
