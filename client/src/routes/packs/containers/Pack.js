import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import Loading from "components/Loading";
import Tabs from "components/Tabs";
import Link from "components/Link";
import GeneratorsList from "containers/GeneratorsList";
import TablesList from "components/TablesList";

import "./Pack.scss";
import { fetchPack, fetchRebuild } from "store/packs";

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

const GENERATORS = "generators";
const TABLES = "tables";
const TAB_LABELS = [GENERATORS, TABLES];

/**
 * View a Pack
 */
class ViewPack extends Component {
	render() {
		const { name, _id, _user: user = {}, url, defaultSeed, isOwner, public: isPublic } = this.props;
		const { generators = {}, tables = [], font, handleRebuild } = this.props;
		return (
			<div className="main" id="view-pack">
				<div className="container mt-5">
					<h1>{name}</h1>

					{isOwner && (
						<div>
							<Link to={"/packs/" + _id + "/edit"}>
								<button className="btn btn-outline-dark">
									<i className="fa fa-pencil-alt" /> Edit Pack
								</button>
							</Link>
							&nbsp;
							<button className="btn btn-danger" onClick={handleRebuild}>
								Rebuild
							</button>
						</div>
					)}

					<PackInfo {...{ isOwner, user, isPublic, url, font, defaultSeed }} />

					<Tabs labels={TAB_LABELS} active={GENERATORS}>
						<Tabs.Pane label={GENERATORS} active={GENERATORS}>
							<GeneratorsList generators={generators} {...{ isOwner, packurl: url }} />
						</Tabs.Pane>
						<Tabs.Pane label={TABLES} active={GENERATORS}>
							<TablesList {...{ tables, isOwner, packurl: url }} />
						</Tabs.Pane>
					</Tabs>
				</div>
			</div>
		);
	}
}

/**
 * Wrapper Component for Pack pages
 */
class Pack extends Component {
	state = {
		filters: {}
	};
	static propTypes = {
		fetchPack: PropTypes.func,
		tables: PropTypes.array,
		generators: PropTypes.object,
		pack: PropTypes.object
	};
	static defaultProps = {
		pack: {},
		fetchPack: () => {}
	};
	constructor(props) {
		super(props);
		props.fetchPack();
	}

	handleRebuild = () => {
		this.props.fetchRebuild(this.props.match.params.pack);
	};

	handleRenameGen = () => {
		this.props.fetchPack(this.props.match.params.pack);
	};

	render() {
		const { error, pack, tables, generators } = this.props;

		if (error) return error.display;
		if (!pack.loaded) {
			return <Loading.Page />;
		}

		return <ViewPack {...{ ...pack, tables, generators }} handleRebuild={this.handleRebuild} />;
	}
}

export default connect(
	(state, { match }) => {
		const packid = state.packs.byUrl[match.params.pack];
		const pack = state.packs.byId[packid];

		// TODO : memoize

		let tables = [];
		if (pack && pack.tables) {
			tables = pack.tables.map(t => {
				return state.tables.byId[t] || {};
			});
		}

		let generators = {};
		if (pack && pack.originalGen) {
			pack.originalGen.forEach(id => {
				const gen = state.generators.byId[id];
				if (gen) generators[gen.isa] = gen;
			});
		}

		return {
			pack,
			tables,
			generators
		};
	},
	(dispatch, { match }) => {
		return {
			fetchPack: () => fetchPack(dispatch, match.params.pack),
			fetchRebuild: () => fetchRebuild(dispatch, match.params.pack),
			dispatch
		};
	},
	(s, d, o) => {
		return {
			...o,
			...s,
			...d
		};
	}
)(Pack);
