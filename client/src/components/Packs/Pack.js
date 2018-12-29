import React, { Component } from "react";
import { Link, Switch } from "react-router-dom";

import DB from "../../actions/CRUDAction";
import { LOADING_GIF } from "../App/App";
import { makeSubRoutes, PropsRoute } from "../Routes";
import { GeneratorsList } from "../Generators";
import { TablesList } from "../Tables/Tables";

import "./Pack.css";

/**
 * View a Pack
 */
const ViewPack = ({
	name,
	_id,
	_user: user = {},
	url,
	defaultSeed,
	isOwner,
	public: isPublic,
	loggedIn,
	gens = {},
	generatorTree,
	tables = [],
	font,
	filters = {},
	filteredGens = [],
	handleFilterToggle = () => {},
	handleGeneratorToggle = () => {},
	query,
	handleQuery,
	handleRebuild,
	match
}) => (
	<div className="main" id="view-pack">
		<div className="container mt-5">
			{/* --------- Name ------------ */}
			<h1>{name}</h1>

			{/* --------- Edit Button ------------ */}
			{!isOwner ? null : (
				<Link to={"/packs/" + _id + "/edit"}>
					<button className="btn btn-primary">
						<i className="fa fa-pencil-alt" /> Edit Pack
					</button>
				</Link>
			)}

			{/* ------- REBUILD ------*/}
			{!isOwner ? null : (
				<button className="btn btn-danger" onClick={handleRebuild}>
					Rebuild
				</button>
			)}

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

			{/* --------- tabs ------------ */}
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

			<div className="tab-content" id="packComponentsContent">
				{/* --------- Generators ------------ */}
				<div
					className="tab-pane fade show active"
					id="generators"
					role="tabpanel"
					aria-labelledby="generators-tab"
				>
					<GeneratorsList generators={gens} {...{ isOwner, match }} />
				</div>

				{/* --------- Tables ------------ */}
				<div
					className="tab-pane fade"
					id="tables"
					role="tabpanel"
					aria-labelledby="tables-tab"
				>
					<TablesList {...{ tables, isOwner, match }} />
				</div>
			</div>
		</div>
	</div>
);

/**
 * Wrapper Component for Pack pages
 */
export default class Pack extends Component {
	state = {
		filters: {}
	};
	constructor(props) {
		super(props);
		props.fetchPack(props.match.params.pack);
	}

	handleRenameGen = () => {
		DB.get("packs", this.props.match.params.pack).then(({ error, data }) => {
			this.setState({ pack: data, error: error });
		});
	};

	handleRebuild = () => {
		const { pack: { packid } = {} } = this.props.match.params || {};
		DB.set("builtpacks", packid + "/rebuild", {}).then(({ error, data }) => {
			this.setState({ error: error });
		});
	};

	render() {
		const { loggedIn, match, routes, error, getPack } = this.props;
		const pack = getPack(match.params.pack);
		const {
			handleRebuild,
			handleFilterToggle,
			handleGeneratorToggle,
			handleRenameGen
		} = this;

		if (error) return error.display;
		if (!pack.loaded) {
			return (
				<div className="main">
					<div className="container mt-5">{LOADING_GIF}</div>
				</div>
			);
		}

		return (
			<div id="Pack">
				<Switch>
					{makeSubRoutes(routes, match.path, {
						pack,
						handleRenameGen,
						loggedIn
					})}
					<PropsRoute
						exact
						path={match.path}
						component={ViewPack}
						{...pack}
						loggedIn={this.props.loggedIn}
						filters={this.state.filters}
						filteredGens={this.state.filteredGens}
						query={this.state.query}
						handleQuery={this.handleQuery}
						gens={this.props.pack && this.props.pack.generators}
						{...{ handleRebuild, handleFilterToggle, handleGeneratorToggle }}
					/>
				</Switch>
			</div>
		);
	}
}
