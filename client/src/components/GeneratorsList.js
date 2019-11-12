import React from "react";

import Link from "components/Link";

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
				this.props.packUrl +
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
		const { generatorTree = {}, generators, packUrl, isOwner = false } = this.props;
		const { handleGeneratorToggle = () => {}, open = [] } = this.props;
		const genTree = generatorTree[isa];
		const isOpen = open.includes(isa);
		const gen = generators[isa];
		return {
			key: isa,
			packUrl,
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
export default class GeneratorsDisplay extends React.PureComponent {
	render() {
		const { query, filters, isOwner, packUrl, handleQuery, ...rest } = this.props;
		const { handleFilterToggle } = this.props;
		return (
			<>
				<div className="input-group">
					<input className="form-control" value={query} onChange={handleQuery} />
					{SEARCH_ICON}
				</div>
				<div className="row">
					<Filters filters={filters} handleFilterToggle={handleFilterToggle} />
					<div className="col">
						{!isOwner ? null : (
							<Link to={"/packs/" + packUrl + "/generators/create"}>{ADD_GENERATOR}</Link>
						)}
						<FiltersToString filters={filters} />
						<hr />
						<NestedGenerators {...rest} {...{ isOwner, packUrl }} />
					</div>
				</div>
			</>
		);
	}
}
