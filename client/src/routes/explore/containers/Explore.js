import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import ExplorePage from "../components/ExplorePage";
import Data from "../components/Data";
import Modals from "../components/Modals";
import Children from "../components/Children";
import Title from "./Title";
import Loading from "components/Loading";
import handleNestedPropertyValue from "util/handleNestedPropertyValue";
import { loadCurrent, getUniverse, getCurrent } from "store/universes";
import { loadFonts } from "store/fonts";
import processInSort from "../util/processInSort";

// TODO: use reselect so we don't calculate current every time
function mapStateToProps(state) {
	const { pack, universe = {}, index, isUniverse } = getUniverse(state);
	return {
		universe,
		pack,
		index,
		current: getCurrent(state.universes.instances, universe, index, isUniverse),
		isUniverse
	};
}

/**
 * This manages the tree data
 */
class Explore extends Component {
	static propTypes = {
		// should be auto-passed from router
		location: PropTypes.object.isRequired,
		match: PropTypes.object.isRequired,
		universe: PropTypes.object,
		current: PropTypes.object
	};
	static defaultProps = {
		location: {},
		universe: { pack: {} },
		current: {}
	};

	state = {
		current: undefined, // the current node being viewed
		lookup: {}, // a lookup of index pointers in case the user uses back/forward
		error: null,
		showAdd: false,
		pack: (this.props.universe && this.props.universe.pack) || {},
		showData: false
	};

	// first ajax data pull
	componentDidMount() {
		this.props.dispatch(loadCurrent());
		this.props.dispatch(loadFonts());
		this.setTitle();
	}

	setTitle() {
		const { isa, name } = this.props.current;
		document.title = isa || name || "Explore";
	}

	componentDidUpdate({ pack = {}, index }) {
		// load fonts
		if (this.props.pack && this.props.pack.font !== pack.font) {
			this.props.dispatch(loadFonts());
		}
		// new last saw
		if (this.props.index !== this.props.universe.lastSaw) {
			// TODO: do this in actions
			// this.props.setLastSaw();
		}
		// new index
		if (this.props.index !== index) {
			if (this.props.current.todo === true) {
				this.props.dispatch(loadCurrent(true));
			}
		}
		//setBodyStyle(this.props.current);
		this.setTitle();
	}

	// will set the history, and component will recieve the new props
	setIndex = index => {
		if (isNaN(index)) return;

		if (this.props.location.hash !== "#" + index) {
			this.props.history.push("#" + index);
		}
	};

	handleRestartUniverse = () => {
		var confirm = window.confirm("Are you sure you want to delete this?");

		if (!confirm) return;

		const current = this.props.current;
		//let index = current.index;
		let parentIndex = current.up && current.up[0] && current.up[0].index;

		this.setIndex(parentIndex || 0);

		this.props.handleDelete(this.props.index);
	};

	handleRestart = doRegenerate => {
		const universe = this.props.match.params.universe;

		if (!universe) this.handleRestartExplore();
		else this.handleRestartUniverse(doRegenerate, universe);
	};

	handleAdd = label => {
		if (!label) {
			return this.setState({ showAdd: true });
		}

		// add link
		if (!isNaN(label)) {
			var inArr = this.props.current.in || [];
			inArr = inArr
				.map(c => c && c.index)
				.filter(c => typeof c !== "string")
				.filter(ind => ind !== null);
			inArr.push(parseInt(label, 10));
			this.handleChange(this.props.current.index, "in", inArr);
			//this.getCurrent(this.props, this.props.current.index);
		}
	};

	toggleData = () => {
		this.setState(prevState => ({ showData: !prevState.showData }));
	};

	doDeleteLink(inArr, value) {
		//const currentInArr = [...inArr];
		var deleteIndex = value;

		return inArr
			.map(c => c && c.index)
			.filter(c => c && typeof c !== "string" && c !== deleteIndex);
	}

	handleChangeClean = (i, p, v) => {
		let index = i,
			property = p,
			value = v;

		if (index === undefined) {
			index = this.props.index;
		}

		var inArr = [].concat(this.props.current.in.filter(child => child && !child.isNew)) || [];
		index = parseInt(index, 10);

		if (property instanceof Array) {
			let result = handleNestedPropertyValue(property, value, this.props.current);
			property = result.property;
			value = result.value;
		}

		if (property === "sort") {
			index = this.props.current.index;
			inArr = processInSort(inArr, value);
			property = "in";
			value = inArr;
		} else if (property === "deleteLink") {
			value = this.doDeleteLink(inArr, value);
			property = "in";
		} else if (property === "in") {
			value = value.filter(i => i !== null);
		} else if (property === "up") {
			value = parseInt(value);
		}

		return { index, property, value };
	};

	handleChange = (i, p, v) => {
		const { index, property, value } = this.handleChangeClean(i, p, v);
		this.props.handleChange(index, property, value, this.props.universe._id);

		if (property === "cssClass") {
			// reset to parent value if reset
			this.props.handleChange(index, "txt", null, this.props.universe._id);
		}
	};

	makeUrlMatchCurrent(nextState, nextProps) {
		const nextHash = this.props.index;
		const isNewIndex = nextProps.current && nextProps.current.index !== nextHash;

		//ensure that the url matches the thing being rendered
		if (isNewIndex) {
			this.setIndex(nextProps.current.index);
		}
	}

	_getTitleProps() {
		const { pack = {}, favorites, toggleFavorite } = this.props;
		return {
			pack,
			favorites,
			toggleFavorite,
			universeId: this.props.universe._id,
			handleChange: this.handleChange,
			handleRestart: this.handleRestartUniverse,
			loaded: this.props.universe.loaded,
			isFavorite: this.props.isFavorite
		};
	}

	render() {
		if (this.props.current.loading) return <Loading.Page />;

		// get props
		const { current, isUniverse, index } = this.props,
			{ handleChange, handleAdd } = this,
			{ showData } = this.state,
			{ data, cssClass, up = [], icon, txt, in: inArr } = current,
			{ generators, tables } = this.props,
			title = current && (current.name || current.isa),
			isLoading = current.todo === true,
			parent = up[0] && up[0].index;

		// TODO: Don't wrap document title, just do it on change.
		return (
			<>
				<ExplorePage cssClass={current.cssClass} txt={current.txt}>
					<div className="row">
						<Title {...{ current, title, isUniverse, ...this._getTitleProps() }} />
						<div className={`children col ${isUniverse ? "children--universe" : ""}`}>
							{showData && <Data {...{ data, generators, tables, handleChange, index }} />}
							{isLoading ? <Loading.Page /> : null}
							<Children {...{ isUniverse, inArr, index, handleAdd, handleChange }} />
						</div>
					</div>
				</ExplorePage>
				{isUniverse && <Modals {...{ handleChange, index, icon, cssClass, txt, parent }} />}
			</>
		);
	}
}

const Container = connect(mapStateToProps)(Explore);

export default Container;
