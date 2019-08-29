import React, { Component } from "react";
import PropTypes from "prop-types";

import splitClass from "util/splitClass";
import "./Ancestors.scss";

const AncestorDropdownItem = ({ a, cls }) => (
	<a className={"ancestors__dropdown-item " + cls} href={`#${a.n}`}>
		{a.name || a.isa}
	</a>
);

const SplitButton = ({ parentInst, style, ancestors, onClick, cls, bg }) => (
	<div
		id="Ancestors"
		className={`ancestors parent col btn-group dropdown ${cls}`}
		role="group"
		style={style}
	>
		<a
			type="button"
			className={`ancestors__split-parent btn immediate btn-${cls}`}
			onClick={() => onClick(parentInst)}
			style={style}
			href={`#${parentInst.n}`}
		>
			<i className="fa fa-caret-left mr-2" /> <span>{parentInst.name || parentInst.isa}</span>
		</a>
		<SplitButtonToggle style={style} cls={cls} />
		<div className={"ancestors__menu dropdown-menu " + cls}>
			{ancestors.map((a, i) => {
				if (i === 0 || !a) return null;
				return <AncestorDropdownItem key={i} {...{ a, bg, onClick }} />;
			})}
		</div>
	</div>
);

const SplitButtonToggle = ({ style, cls }) => (
	<button
		type="button"
		className={`ancestors__toggler btn dropdown-toggle dropdown-toggle-split btn-${cls}`}
		data-toggle="dropdown"
		aria-haspopup="true"
		aria-expanded="false"
		style={style}
	>
		<span className="sr-only">Toggle Dropleft</span>
	</button>
);

const OneButton = ({ parentInst }) => (
	<a
		id="Ancestors"
		href={`#${parentInst.n}`}
		className={"ancestors__one-button col parent btn btn-" + parentInst.cls}
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
		this.props.handleClick(ancestor);
	}
	render() {
		const a = this.props.ancestors || [];
		const parent = a[0] || {};
		var cls = parent.cls + (parent.cls === this.props.pageClass ? " transparent" : "");
		if (!cls || cls === undefined || cls === "undefined") cls = "bg-grey-900";

		return !a || !a.length ? (
			<div className="col" />
		) : a.length > 1 ? (
			<SplitButton
				parentInst={parent}
				cls={cls}
				{...splitClass(cls)}
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
				cls={cls}
				style={{
					color: parent.txt
				}}
			/>
		);
	}
}
