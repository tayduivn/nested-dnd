import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import EditGeneratorDisplay from "./EditGeneratorDisplay";
import {
	fetchGenerator,
	changeGenerator,
	createGenerator,
	CLEAR_GENERATOR_ERRORS
} from "./actions";
import { fetchPackIfNeeded } from "../Packs/actions";
import { genPathSelector } from "./reducers";
import Page from "../Util/Page";
import { tablesSelect } from "../Tables/redux/selectors";

import "./EditGenerator.css";

class EditGeneratorComponent extends Component {
	static propTypes = {
		built: PropTypes.object,
		unbuilt: PropTypes.object,
		pack: PropTypes.object,
		handleChange: PropTypes.func,
		tables: PropTypes.array
	};

	static defaultProps = {
		unbuilt: {},
		pack: {},
		url: ""
	};

	componentDidMount() {
		this.props.dispatch(fetchGenerator(this.props.match.params));
		this.props.dispatch(fetchPackIfNeeded(this.props.match.params.pack));
	}
	shouldComponentUpdate(nextProps) {
		const built = JSON.stringify(this.props.built) !== JSON.stringify(nextProps.built);
		const unbuilt = JSON.stringify(this.props.unbuilt) !== JSON.stringify(nextProps.unbuilt);
		const pack = JSON.stringify(this.props.pack) !== JSON.stringify(nextProps.pack);
		return built || unbuilt || pack;
	}

	componentWillUnmount() {
		// clear all generators with errors
		this.props.clearErrors();
	}

	handleAdd = () => {
		const isa = document.getElementById("generatorIsa").value;
		this.props.dispatch(this.props.createGenerator(this.props.pack.url, isa));
	};

	handleChange = change => {
		const { pack, id, isa } = this.props;
		if (!this.props.isCreate) {
			this.props.dispatch(this.props.changeGenerator(pack.url, pack.id, id, isa, change));
		}
	};
	_getProps() {
		const { isCreate, match, pack, unbuilt = {}, inherits } = this.props;
		return {
			...unbuilt,
			style: undefined,
			...unbuilt.style,
			readOnly: unbuilt.loading,
			handleChange: this.handleChange,
			generators: pack.generators,
			tables: this.props.tables,
			isCreate,
			match,
			inherits,
			key: unbuilt.id,
			handleAdd: this.handleAdd,
			url: match.params.pack
		};
	}

	render() {
		//todo: do something with built
		const { unbuilt = {}, built = {} } = this.props;
		const error = unbuilt.error || built.error;
		if (error) {
			return <Page>{error.display}</Page>;
		}

		return (
			<div id="Generator" className="main">
				<EditGeneratorDisplay {...this._getProps()} />
			</div>
		);
	}
}

const defaultGen = isa => ({ [isa]: { gen_ids: [] } });

const EditGenerator = connect(
	function mapStateToProps(state, ownProps) {
		// because we are fucking with the url, we need to make our own match based on real url
		const match = genPathSelector({
			router: { ...state.router, location: { ...state.router.location, ...window.location } }
		}) || { params: {} };

		const packid = state.packs.byUrl[match.params.pack];

		const isa = decodeURIComponent(match.params.generator);
		const pack = state.packs.byId[packid] || {
			url: match.params.pack,
			generators: defaultGen(isa)
		};
		const built = pack.generators[isa] || {};
		const id = built.gen_ids && built.gen_ids[0];
		const isCreate = window.location.pathname.endsWith("/create");
		const unbuilt = state.generators.byId[id] || {};

		return {
			pack,
			built,
			id,
			isa,
			unbuilt,
			builtGenerator: pack.generators[ownProps.match.params.generator],
			isCreate,
			inherits: built.gen_ids && built.gen_ids.length > 1,
			tables: tablesSelect(state, pack)
		};
	},
	function mapDispatchToProps(dispatch, ownProps) {
		return {
			clearErrors: () => dispatch({ type: CLEAR_GENERATOR_ERRORS }),
			changeGenerator,
			createGenerator
		};
	}
)(EditGeneratorComponent);

export default EditGenerator;
