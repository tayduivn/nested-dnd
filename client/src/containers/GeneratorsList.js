import React from "react";
import PropTypes from "prop-types";

import GeneratorsDisplay from "components/GeneratorsList";

/**
 * Handles building the tree and filtering
 * @extends React
 */
export default class GeneratorsList extends React.Component {
	static propTypes = {
		generators: PropTypes.object,
		isOwner: PropTypes.bool,
		packUrl: PropTypes.string.isRequired
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

	// static getDerivedStateFromProps(nextProps) {
	// 	if (this.props.generators !== nextProps.generators) {
	// 		let generatorTree = this.buildTree(nextProps.generators);
	// 		this.setState({ generatorTree });
	// 	}
	// }

	buildTree = gens => {
		const tree = {};
		const pointers = {};

		for (var isa in gens) {
			let extend = gens[isa];

			// set up placeholders
			if (!pointers[isa]) {
				pointers[isa] = {};
			}
			if (!pointers[extend]) {
				pointers[extend] = {};
			}

			if (!extend) {
				tree[isa] = pointers[isa];
			} else {
				pointers[extend][isa] = pointers[isa];
			}
		}
		return tree;
	};

	determineInclude = (gen, query, isa = "", filters) => {
		let include = true;
		isa = isa.toLowerCase();
		query = query && query.toLowerCase();

		if (
			(query && !(isa.includes && isa.includes(query))) ||
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
				gen = { isa, extends: generators[isa] };
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
		const { isOwner, generators, packUrl } = this.props;
		const { handleGeneratorToggle, handleFilterToggle, handleQuery } = this;

		return (
			<GeneratorsDisplay
				{...this.state}
				{...{ handleGeneratorToggle, handleFilterToggle }}
				{...{ handleQuery, isOwner, generators, packUrl }}
			/>
		);
	}
}
