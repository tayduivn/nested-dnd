import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import Loading from "components/Loading";
import PackDisplay from "../components/PackDisplay";

import { fetchPack, fetchRebuild } from "store/packs";
import { fetchPackGenerators } from "store/generators";
import { fetchPackTables } from "store/tables";

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
		pack: {}
	};
	constructor(props) {
		super(props);
		props.dispatch(fetchPackGenerators(props.packUrl));
		props.dispatch(fetchPackTables(props.packUrl));
	}

	handleRebuild = () => {
		this.props.fetchRebuild(this.props.match.params.pack);
	};

	handleRenameGen = () => {
		// TODO: what?
		this.props.fetchPack(this.props.match.params.pack);
	};

	render() {
		const { error, pack, activeTab, tables } = this.props;

		if (error) return error.display;
		if (!pack.isLoaded) {
			return <Loading.Page />;
		}

		return <PackDisplay {...{ ...pack, activeTab, tables }} handleRebuild={this.handleRebuild} />;
	}
}

export default connect(
	(state, ownProps) => {
		const pack_id = state.packs.byUrl[ownProps.match.params.pack];
		const pack = state.packs.byId[pack_id];

		// TODO : memoize

		let tables = [];
		if (pack && pack.tables) {
			tables = pack.tables.map(t => {
				const table = state.tables.byId[t] || {};
				table._id = t;
				return table;
			});
		}

		return {
			packUrl: ownProps.match.params.pack,
			pack,
			tables,
			activeTab: ownProps.location.hash.substr(1)
		};
	},
	(dispatch, ownProps) => {
		return {
			fetchPack: () => fetchPack(dispatch, ownProps.match.params.pack),
			fetchRebuild: () => fetchRebuild(dispatch, ownProps.match.params.pack),
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
