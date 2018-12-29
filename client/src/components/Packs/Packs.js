import React, { Component } from "react";
import { Switch, Route } from "react-router-dom";
import { Link } from "../Util";
import { connect } from "react-redux";

import { LOADING_GIF } from "../App";
import { loadFonts } from "../App/store";
import { makeSubRoutes, PropsRoute } from "../Routes";

import "./Packs.css";

const PackLink = ({
	_id,
	name,
	title,
	txt,
	font,
	cssClass,
	description,
	isUniverse,
	dependencies,
	lastSaw,
	...pack
}) => (
	<li className={`col`}>
		<div className="btn-group">
			<Link
				to={isUniverse ? "/universes/" + _id + "/explore" : "/packs/" + _id}
				className={`btn col ${cssClass}`}
				style={{ color: txt }}
			>
				<h1 style={{ fontFamily: font ? `'${font}', serif` : "inherit" }}>
					{title || name}
				</h1>
				{description ? <p>{description}</p> : null}
				{isUniverse && dependencies && dependencies.length ? (
					<p>
						<strong>Packs</strong>: {dependencies.join(", ")}
					</p>
				) : null}
				{lastSaw ? (
					<p>
						<strong>Currently viewing:</strong> {lastSaw}
					</p>
				) : null}
			</Link>
			<Link
				to={(isUniverse ? "/universes/" : "/packs/") + _id + "/edit"}
				className={`edit btn col-xs-auto d-flex align-items-center justify-content-center ${cssClass}`}
				style={{ color: txt }}
			>
				<h2>
					<i className="fas fa-pen-square" />
					<small>Edit</small>
				</h2>
			</Link>
		</div>
	</li>
);

const PackInput = ({
	_id,
	name,
	txt,
	font,
	cssClass,
	description,
	selected,
	onSelect,
	url,
	...pack
}) => (
	<li className={`col`}>
		<div className="btn-group">
			<button
				onClick={onSelect}
				id={_id}
				className={`btn col ${cssClass}`}
				style={{ color: txt }}
			>
				<h1
					className="webfont"
					style={{ fontFamily: font ? `'${font}', serif` : "inherit" }}
				>
					<span className={`fa-stack ${selected ? "selected" : ""}`}>
						<i className="fas fa-circle fa-2x" />
						<i className="fa fa-check fa-stack-1x" />
					</span>
					{name}
				</h1>
				{description ? <p>{description}</p> : null}
			</button>
			{url ? (
				<Link
					to={"/explore/" + url}
					className={`explore btn col-xs-auto ${cssClass}`}
					style={{ color: txt }}
				>
					<h2>
						<i className="fas fa-eye" />
						<small>preview</small>
					</h2>
				</Link>
			) : null}
		</div>
	</li>
);

class PackULInner extends Component {
	componentDidMount() {
		if (this.props.list) this.loadFonts(this.props.list);
	}

	shouldComponentUpdate(nextProps) {
		return JSON.stringify(this.props) !== JSON.stringify(nextProps);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.list) this.loadFonts(nextProps.list);
	}

	loadFonts(list) {
		var fonts = [];
		list.forEach(pack => {
			if (!pack.font) return;
			if (!fonts.includes(pack.font)) fonts.push(pack.font);
		});

		if (fonts.length) this.props.loadFonts(fonts);
	}
	render() {
		const list = this.props.list,
			selectable = this.props.selectable,
			selected = this.props.selected,
			onSelect = this.props.onSelect,
			addButton = this.props.addButton,
			isUniverse = this.props.isUniverse;

		return (
			<ul className="row packs">
				{list
					? list.map(p => {
							return selectable ? (
								<PackInput
									key={p._id}
									{...p}
									selected={selected === p._id}
									onSelect={onSelect}
								/>
							) : (
								<PackLink
									key={p._id}
									{...p.pack}
									{...p}
									isUniverse={isUniverse}
								/>
							);
					  })
					: null}
				{addButton ? (
					<li className="col">
						<Link
							to={`${isUniverse ? "/universes" : "/packs"}/create`}
							className="create col btn btn-outline-primary d-flex align-items-center justify-content-center"
						>
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

const PackUL = connect(
	state => ({}),
	dispatch => ({
		loadFonts: (fonts, source) => dispatch(loadFonts(fonts, source))
	})
)(PackULInner);

const MyPacks = ({ myPacks }) => (
	<div>
		<h2>My Packs</h2>
		{myPacks === null && LOADING_GIF}
		{myPacks && myPacks.length === 0 && (
			<p>You have not created any packs yet</p>
		)}
		{myPacks && <PackUL list={myPacks} addButton={true} />}
	</div>
);

const PacksList = ({ loggedIn, error, myPacks, publicPacks }) => (
	<div id="Packs > PacksList">
		{loggedIn && <MyPacks myPacks={myPacks} />}

		<h2>Public Packs</h2>

		{myPacks === null && LOADING_GIF}
		{error && error.display}

		{publicPacks && publicPacks.length === 0 && (
			<p>There are no public packs to display</p>
		)}
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
		<Switch>
			<PropsRoute
				exact
				path={match.path}
				component={PacksPageWrap}
				{...props}
			/>
			{makeSubRoutes(routes, match.path, props)}
		</Switch>
	</div>
);

export default Packs;
export { PackUL, PacksList };
