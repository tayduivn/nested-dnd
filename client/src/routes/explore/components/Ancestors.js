import React, { Component } from "react";
import PropTypes from "prop-types";

import splitClass from "util/splitClass";

const AncestorDropdownItem = ({ a, cssclass, onClick }) => (
	<a className={"ancestors__dropdown-item " + cssclass} href={`#${a.index}`}>
		{a.name || a.isa}
	</a>
);

const SplitButton = ({ parentInst, style, ancestors, onClick, cssclass, border, bg, ptn }) => (
	<div
		id="Ancestors"
		className={`ancestors parent col btn-group dropdown ${cssclass}`}
		role="group"
		style={style}
	>
		<a
			type="button"
			className={`ancestors__split-parent btn immediate btn-${cssclass}`}
			onClick={() => onClick(parentInst)}
			style={style}
			href={`#${parentInst.index}`}
		>
			<i className="fa fa-caret-left mr-2" /> <span>{parentInst.name || parentInst.isa}</span>
		</a>
		<SplitButtonToggle style={style} cssclass={cssclass} />
		<div className={"ancestors__menu dropdown-menu " + cssclass}>
			{ancestors.map((a, i) => {
				if (i === 0 || !a) return null;
				return <AncestorDropdownItem key={i} {...{ a, bg, onClick }} />;
			})}
		</div>
	</div>
);

const SplitButtonToggle = ({ style, cssclass }) => (
	<button
		type="button"
		className={`ancestors__toggler btn dropdown-toggle dropdown-toggle-split btn-${cssclass}`}
		data-toggle="dropdown"
		aria-haspopup="true"
		aria-expanded="false"
		style={style}
	>
		<span className="sr-only">Toggle Dropleft</span>
	</button>
);

const OneButton = ({ onClick, parentInst }) => (
	<a
		id="Ancestors"
		href={`#${parentInst.index}`}
		className={"ancestors__one-button col parent btn btn-" + parentInst.cssClass}
		style={{ color: parentInst.txt }}
	>
		<i className="fa fa-caret-left mr-2" /> <span>{parentInst.name || parentInst.isa}</span>
	</a>
);

export default class Ancestors extends Component {
	static propTypes = {
		ancestors: PropTypes.array, // index n ame
		handleClick: PropTypes.func
	};

	static defaultProps = {
		ancestors: [{}],
		handleClick: () => {}
	};
	constructor(props) {
		super(props);
		this.onClick = this.onClick.bind(this);
	}
	onClick(ancestor) {
		ancestor.in = true;
		this.props.handleClick(ancestor);
	}
	render() {
		const a = this.props.ancestors;
		const parent = a[0] || {};
		var cssClass =
			parent.cssClass + (parent.cssClass === this.props.pageClass ? " transparent" : "");
		if (!cssClass || cssClass === undefined || cssClass === "undefined") cssClass = "bg-grey-900";

		return !a || !a.length ? (
			<div className="col" />
		) : a.length > 1 ? (
			<SplitButton
				parentInst={parent}
				cssclass={cssClass}
				{...splitClass(cssClass)}
				style={{
					color: parent.txt
				}}
				ancestors={a}
				onClick={this.onClick}
			/>
		) : (
			<OneButton
				parentInst={parent}
				onClick={this.onClick}
				cssclass={cssClass}
				style={{
					color: parent.txt
				}}
			/>
		);
	}
}
