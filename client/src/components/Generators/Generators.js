import React from "react";
import { Link } from "../Util";
import PropTypes from "prop-types";

import DB from "../../actions/CRUDAction";

const SEARCH_ICON = (
	<div className="input-group-append">
		<span className="input-group-text">
			<i className="fa fa-search" />
		</span>
	</div>
);

const ADD_GENERATOR = (
	<button className="btn btn-outline-dark">
		<i className="fa fa-plus" /> Add Generator
	</button>
);

/**
 * Display the filters
 * @param {Object} [filters={}]       [description]
 * @param {[type]} handleFilterToggle [description]
 */
const Filters = ({ filters = {}, handleFilterToggle }) => (
	<div className="filters col-auto">
		<div className="form-check">
			<input
				className="form-check-input"
				type="checkbox"
				value={filters.unique}
				id="unique"
				onChange={() => handleFilterToggle("unique")}
			/>
			<label className="form-check-label" htmlFor="unique">
				Unique
			</label>
		</div>
	</div>
);

/**
 * List the currently selected filters as a string
 * @param {Array} [filters=[] }] [description]
 */
const FiltersToString = ({ filters = [] }) => (
	<div>
		{filters.length ? (
			<span>
				<i className="fa fa-filter" />
				Filtered by: {filters.join(", ")}
			</span>
		) : null}
	</div>
);

class OpenButton extends React.PureComponent {
	render() {
		const { handleGeneratorToggle, isOpen, isa } = this.props;
		return (
			<button className="mr-1" onClick={() => handleGeneratorToggle(isa)}>
				<i className={`fas fa-${isOpen ? "minus" : "plus"}-circle`} />
			</button>
		);
	}
}

/**
 * A link and its recursive nested tree beneath
 * @extends React
 */
class GenLink extends React.PureComponent {
	_getLink() {
		const isa = (this.props.gen && this.props.gen.isa) || "";
		return encodeURI(
			"/packs/" +
				this.props.packurl +
				"/generators/" +
				encodeURIComponent(isa.replace(/\\/g, "\\")) +
				(this.props.isOwner ? "/edit" : "")
		);
	}

	_getChildProps(isa) {
		return {
			...this.props,
			key: isa,
			gen: this.props.generators[isa],
			genTree: this.props.genTree[isa],
			isOpen: this.props.open.includes(isa)
		};
	}
	render() {
		const { gen = {}, genTree = {}, isOpen, handleGeneratorToggle } = this.props;
		return (
			<React.Fragment>
				<li>
					{Object.keys(genTree).length ? (
						<OpenButton {...{ handleGeneratorToggle, isOpen, isa: gen.isa }} />
					) : null}
					<Link to={this._getLink()}>{gen.isa}</Link>
					{gen.extends ? <em className="ml-2">{gen.extends}</em> : null}
				</li>
				{isOpen ? (
					<ul>
						{Object.keys(genTree).map(isa => (
							<GenLink {...this._getChildProps(isa)} />
						))}
					</ul>
				) : null}
			</React.Fragment>
		);
	}
}

/**
 * Renders the list
 * @extends React
 */
class NestedGenerators extends React.PureComponent {
	_getProps(isa) {
		const { generatorTree = {}, generators, packurl, isOwner = false } = this.props;
		const { handleGeneratorToggle = () => {}, open = [] } = this.props;
		const genTree = generatorTree[isa];
		const isOpen = open.includes(isa);
		const gen = generators[isa];
		return {
			key: isa,
			packurl,
			isOwner,
			handleGeneratorToggle,
			gen,
			genTree,
			isOpen,
			generators,
			open
		};
	}
	render() {
		const { generatorTree = {} } = this.props;
		const { filteredGens = [] } = this.props;
		const sortedGens = Object.keys(generatorTree).sort();
		return (
			<ul>
				{filteredGens && filteredGens.map
					? filteredGens.map(isa => <GenLink {...this._getProps(isa)} />)
					: sortedGens.map(isa => <GenLink {...this._getProps(isa)} />)}
			</ul>
		);
	}
}

/**
 * Display the generators tab
 * @extends React
 */
class GeneratorsDisplay extends React.PureComponent {
	render() {
		const { query, filters, isOwner, packurl, handleQuery, ...rest } = this.props;
		const { handleFilterToggle } = this.props;
		return (
			<div>
				<h2>Generators</h2>
				<div className="input-group">
					<input className="form-control" value={query} onChange={handleQuery} />
					{SEARCH_ICON}
				</div>
				<div className="row">
					<Filters filters={filters} handleFilterToggle={handleFilterToggle} />
					<div className="col">
						{!isOwner ? null : (
							<Link to={"/packs/" + packurl + "/generators/create"}>{ADD_GENERATOR}</Link>
						)}
						<FiltersToString filters={filters} />
						<hr />
						<NestedGenerators {...rest} {...{ isOwner, packurl }} />
					</div>
				</div>
			</div>
		);
	}
}

/**
 * Handles building the tree and filtering
 * @extends React
 */
class GeneratorsList extends React.Component {
	static propTypes = {
		generators: PropTypes.object,
		isOwner: PropTypes.bool,
		match: PropTypes.object
	};

	state = {
		filters: {},
		query: "",
		generatorTree: {},
		filteredGens: false,
		open: []
	};

	constructor(props) {
		super(props);
		this.state.generatorTree = this.buildTree(props.generators || {});
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		if (this.props.generators !== nextProps.generators) {
			let generatorTree = this.buildTree(nextProps.generators);
			this.setState({ generatorTree });
		}
	}

	buildTree = gens => {
		const generators = gens;
		var genTree = {};
		var current, extendsPath;
		var placed = [];

		for (var isa in generators) {
			if (placed.includes(isa)) continue;

			current = genTree;
			extendsPath = (generators[isa] && generators[isa].extendsPath) || [];

			// extends path
			for (var i = 0, is; i < extendsPath.length; i++) {
				is = extendsPath[i];

				if (!current[is]) current[is] = {};
				current = current[is];
				if (!placed.includes(is)) placed.push(is);
			}
			current[isa] = {};
			placed.push(isa);
		}
		return genTree;
	};

	determineInclude = (gen, isa) => {
		const { filters, query } = this.state;
		let include = true;

		if (
			(query && !isa.includes(query)) ||
			(filters.unique && gen.isUnique) ||
			(filters.notUnique && !gen.isUnique)
		) {
			include = false;
		}
		return include;
	};

	filterGenerators = () => {
		this.setState(state => {
			var filteredGens = [],
				hidden = 0,
				gen,
				{ filters, query } = state,
				{ generators } = this.props;

			if (query.length < 3) query = false;

			for (var isa in generators) {
				gen = generators[isa];
				const include = this.determineInclude(gen, query, isa, filters);

				if (include) {
					filteredGens.push(gen.isa);
				} else hidden++;
			}

			// no filter
			if (hidden === 0 && !query) filteredGens = false;

			return { filteredGens };
		});
	};

	handleGeneratorToggle = isa => {
		// make a copy so we don't directly edit the state
		var open = [...this.state.open];
		const index = open.indexOf(isa);
		if (index === -1) open.push(isa);
		else open.splice(index, 1);

		this.setState({ open: open });
		this.filterGenerators();
	};

	handleQuery = event => {
		this.setState({ query: event.target.value });
		this.filterGenerators();
	};

	handleFilterToggle = key => {
		let filters = { ...this.state.filters, [key]: !this.state.filters[key] };
		this.setState({ filters: filters });
		this.filterGenerators();
	};

	render() {
		const { isOwner, generators, packurl } = this.props;
		const { handleGeneratorToggle, handleFilterToggle, handleQuery } = this;

		return (
			<GeneratorsDisplay
				{...this.state}
				{...{ handleGeneratorToggle, handleFilterToggle }}
				{...{ handleQuery, isOwner, generators, packurl }}
			/>
		);
	}
}

/**
 * Handles DB call
 * TODO: connect
 * @extends React
 */
class Generators extends React.Component {
	static propTypes = {
		handleRenameGen: PropTypes.func
	};

	static defaultProps = {
		handleRenameGen: () => {}
	};

	handleAdd = isa => {
		var payload = { isa: isa };
		const packid = this.props.match.params.pack;

		// TODO: Do as action
		DB.create("packs/" + packid + "/generators", payload).then(({ error, data: generator }) => {
			if (error) return this.setState({ error });
			this.setState({ generator }, () => {
				this.props.history.replace(
					this.props.location.pathname.replace("/create", "/" + isa + "/edit")
				);
				this.props.handleRenameGen(null, isa, generator.unbuilt);
			});
		});
	};

	render() {
		const { routes, match, pack, ...rest } = this.props;
		const { handleAdd } = this;

		return (
			<div id="Generators" className="main">
				<div className="container mt-5">
					<GeneratorsList {...{ routes, match, pack, ...rest, handleAdd }} />
				</div>
			</div>
		);
	}
}

export default Generators;
export { GeneratorsList };
