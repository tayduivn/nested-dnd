import React, { Component } from "react";
import { Link, Switch } from "react-router-dom";

import { LOADING_GIF } from "../App/App";
import { PropsRoute } from "../Routes";
import { GeneratorsList } from "../Generators";
import { TablesList } from "../Tables/Tables";

import "./Pack.css";

const LOADING = (
	<div className="main">
		<div className="container mt-5">{LOADING_GIF}</div>
	</div>
);

const TABS = (
	<ul className="nav nav-tabs" id="packComponents" role="tablist">
		<li className="nav-item">
			<a
				className="nav-link active"
				id="generators-tab"
				data-toggle="tab"
				href="#generators"
				role="tab"
				aria-controls="generators"
				aria-selected="true"
			>
				Generators
			</a>
		</li>
		<li className="nav-item">
			<a
				className="nav-link"
				id="tables-tab"
				data-toggle="tab"
				href="#tables"
				role="tab"
				aria-controls="tables"
				aria-selected="false"
			>
				Tables
			</a>
		</li>
	</ul>
);

class PackInfo extends React.PureComponent {
	render() {
		const { isOwner, user, isPublic, url, font, defaultSeed } = this.props;
		return (
			<ul>
				{/* --------- Author ------------ */}
				{isOwner ? null : (
					<li>
						<strong>Author: </strong>
						<Link to={"/user/" + user._id}>{user.name}</Link>
					</li>
				)}

				{/* --------- Public ------------ */}
				<li>{isPublic ? "Public" : "Private"}</li>
				{url ? (
					<li>
						<Link to={"/explore/" + url}>Explore</Link>
					</li>
				) : null}

				{/* --------- Font ------------ */}
				<li>Font: {font}</li>

				{/* --------- Default Seed ------------ */}
				{defaultSeed ? (
					<li>
						<strong>DefaultSeed: </strong> {defaultSeed}
					</li>
				) : null}

				{/* --------- Dependencies: TODO ------------ */}
			</ul>
		);
	}
}

class TabContent extends React.PureComponent {
	render() {
		const { gens, isOwner, match, tables } = this.props;
		return (
			<div className="tab-content" id="packComponentsContent">
				<div
					className="tab-pane fade show active"
					id="generators"
					role="tabpanel"
					aria-labelledby="generators-tab"
				>
					<GeneratorsList generators={gens} {...{ isOwner, match }} />
				</div>
				<div className="tab-pane fade" id="tables" role="tabpanel" aria-labelledby="tables-tab">
					<TablesList {...{ tables, isOwner, match }} />
				</div>
			</div>
		);
	}
}

/**
 * View a Pack
 */
class ViewPack extends Component {
	render() {
		const { name, _id, _user: user = {}, url, defaultSeed, isOwner, public: isPublic } = this.props;
		const { gens = {}, tables = [], font, handleRebuild, match } = this.props;
		return (
			<div className="main" id="view-pack">
				<div className="container mt-5">
					<h1>{name}</h1>

					{isOwner && (
						<div>
							<Link to={"/packs/" + _id + "/edit"}>
								<button className="btn btn-primary">
									<i className="fa fa-pencil-alt" /> Edit Pack
								</button>
							</Link>
							<button className="btn btn-danger" onClick={handleRebuild}>
								Rebuild
							</button>
						</div>
					)}

					<PackInfo {...{ isOwner, user, isPublic, url, font, defaultSeed }} />

					{TABS}

					<TabContent {...{ gens, isOwner, match, tables }} />
				</div>
			</div>
		);
	}
}

export default class Pack extends React.PureComponent {
	render() {
		const { match, pack = {}, loggedIn, handleRebuild } = this.props;
		return (
			<div id="Pack">
				<Switch>
					<PropsRoute
						component={PackPage}
						{...{ exact: true, path: match.path, gens: pack.generators }}
						{...{ pack, loggedIn, handleRebuild }}
					/>
				</Switch>
			</div>
		);
	}
}
//{makeSubRoutes(routes, match.path, { pack, handleRenameGen })}

/**
 * Wrapper Component for Pack pages
 */
class PackPage extends Component {
	state = {
		filters: {}
	};
	static defaultProps = {
		fetchPack: () => {},
		getPack: () => {}
	};
	constructor(props) {
		super(props);
		props.fetchPack(props.match.params.pack);
	}

	handleRebuild = () => {
		this.props.fetchRebuild(this.props.match.params.pack);
	};

	handleRenameGen = () => {
		this.props.fetchPack(this.props.match.params.pack);
	};

	render() {
		const { match, error, getPack } = this.props;
		const pack = getPack(match.params.pack) || {};

		if (error) return error.display;
		if (!pack.loaded) {
			return LOADING;
		}

		return <ViewPack {...pack} />;
	}
}
