import React from "react";
import Link from "../Util/Link";

import "./Packs.css";

import { LOADING_GIF } from "../App/App";
import { loadFonts } from "../App/store";

const EDIT_BUTTON = (
	<h2>
		<i className="fas fa-pen-square" />
		<small>Edit</small>
	</h2>
);

const EDITBTN_CLS =
	"edit btn col-xs-auto d-flex align-items-center justify-content-center packlink__btn";

class PackLink extends React.PureComponent {
	render() {
		const { _id, name, url, title, txt, font, description, isUniverse } = this.props;
		const { dependencies, lastSaw, cssClass = "bg-grey-900" } = this.props;
		const URL = isUniverse ? `/universes/${_id}` : `/packs/${url}`;
		const style = { color: txt };
		return (
			<li className={`col`}>
				<div className="btn-group">
					<Link to={`${URL}/explore`} className={`btn col packlink__btn ${cssClass}`}>
						<h1 style={{ fontFamily: font ? `'${font}', serif` : "inherit" }}>{title || name}</h1>
						{description && <p>{description}</p>}
						{isUniverse && dependencies && dependencies.length && (
							<p>
								<strong>Packs</strong>: {dependencies.join(", ")}
							</p>
						)}
						{lastSaw && (
							<p>
								<strong>Currently viewing:</strong> {lastSaw}
							</p>
						)}
					</Link>
					<Link to={`${URL}/edit`} className={`${EDITBTN_CLS} ${cssClass}`} style={style}>
						{EDIT_BUTTON}
					</Link>
				</div>
			</li>
		);
	}
}

class PackInput extends React.PureComponent {
	render() {
		const { _id, name, txt, font, cssClass, description, selected, url } = this.props;
		const { onSelect } = this.props;
		const exploreLinkClass = `explore btn col-xs-auto ${cssClass}`;
		const style = { color: txt };
		return (
			<li className={`col`}>
				<div className="btn-group">
					<button {...{ onClick: onSelect, _id, style }} className={`btn col ${cssClass}`}>
						<h1 className="webfont" style={{ fontFamily: font ? `'${font}', serif` : "inherit" }}>
							<span className={`fa-stack ${selected ? "selected" : ""}`}>
								<i className="fas fa-circle fa-2x" />
								<i className="fa fa-check fa-stack-1x" />
							</span>
							{name}
						</h1>
						{description ? <p>{description}</p> : null}
					</button>
					{url ? (
						<Link to={"/explore/" + url} className={exploreLinkClass}>
							<h2>
								<i className="fas fa-eye" />
								<small>preview</small>
							</h2>
						</Link>
					) : null}
				</div>
			</li>
		);
	}
}

const ADD_BUTTON_CLASSNAME =
	"create col btn btn-outline-dark d-flex align-items-center justify-content-center";

class PackUL extends React.Component {
	componentDidMount() {
		if (this.props.list) this.loadFonts(this.props.list);
	}

	shouldComponentUpdate(nextProps) {
		const updated = JSON.stringify(this.props) !== JSON.stringify(nextProps);
		return updated;
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.list) this.loadFonts(nextProps.list);
	}

	loadFonts(list) {
		var fonts = [];
		list.forEach((pack = {}) => {
			if (!pack.font) return;
			if (!fonts.includes(pack.font)) fonts.push(pack.font);
		});

		if (fonts.length) loadFonts(fonts);
	}
	render() {
		const list = this.props.list || [],
			selectable = this.props.selectable,
			selected = this.props.selected,
			onSelect = this.props.onSelect,
			addButton = this.props.addButton,
			isUniverse = this.props.isUniverse,
			to = `${isUniverse ? "/universes" : "/packs"}/create`;

		return (
			<ul className="row packs">
				{list.map((p = {}) => {
					return selectable ? (
						<PackInput key={p._id} {...p} selected={selected === p._id} onSelect={onSelect} />
					) : (
						<PackLink key={p._id} {...p} isUniverse={isUniverse} />
					);
				})}
				{addButton ? (
					<li className="col">
						<Link to={to} className={ADD_BUTTON_CLASSNAME}>
							<span>
								<i className="fas fa-plus" /> Create new
							</span>
						</Link>
					</li>
				) : null}
			</ul>
		);
	}
}

const MyPacks = ({ myPacks = [] }) => (
	<div>
		<h2>My Packs</h2>
		{myPacks === null && LOADING_GIF}
		{myPacks && myPacks.length === 0 && <p>You have not created any packs yet</p>}
		{myPacks && <PackUL list={myPacks} addButton={true} />}
	</div>
);

const PacksList = ({ loggedIn, error, myPacks, publicPacks }) => (
	<div id="Packs > PacksList">
		{loggedIn && <MyPacks myPacks={myPacks} />}

		<h2>Public Packs</h2>

		{myPacks === null && LOADING_GIF}
		{error && error.display}

		{publicPacks && publicPacks.length === 0 && <p>There are no public packs to display</p>}
		{publicPacks && <PackUL list={publicPacks} />}
	</div>
);

const PacksPageWrap = props => (
	<div className="main">
		<div className="container mt-5">
			<PacksList {...props} />
		</div>
	</div>
);

const Packs = ({ routes, match = {}, ...props }) => (
	<div id="Packs">
		<PacksPageWrap {...props} match={match} />
	</div>
);

export default Packs;
export { PackUL, PacksList };
