import React, { Component } from "react";
import PropTypes from "prop-types";

import ExplorePage, { LOADING, Data, Modals, Children } from "./ExplorePage";
import Title from "./Title";
import { handleNestedPropertyValue } from "../../util";

import "./index.css";

/**
 * This manages the tree data
 */
export default class Explore extends Component {
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

	constructor(props) {
		super(props);

		if (props.location.state) {
			this.state = { ...this.state, ...props.location.state };
		}
	}

	// first ajax data pull
	componentDidMount() {
		this._mounted = true;
		this.props.loadCurrent();

		//var index = this.getIndexFromHash(this.props);
		//setBodyStyle(this.props.current);
		this.props.loadFonts();
		this.setTitle();
	}

	setTitle() {
		const { isa, name } = this.props.current;
		document.title = isa || name || "Explore";
	}

	componentDidUpdate({ pack = {}, index, ...prevProps }) {
		// load fonts
		if (this.props.pack && this.props.pack.font !== pack.font) {
			this.props.loadFonts();
		}
		// new last saw
		if (this.props.index !== this.props.universe.lastSaw) {
			this.props.setLastSaw();
		}
		// new index
		if (this.props.index !== index) {
			if (this.props.current.todo === true) {
				this.props.loadCurrent(true);
			}
		}
		//setBodyStyle(this.props.current);
		this.setTitle();
	}

	determineChange = (props, nextProps) => {
		const isNewPack =
			props.match.params.packurl !== nextProps.match.params.packurl &&
			!!nextProps.match.params.packurl;
		const isNewNode =
			this.props.current && "#" + this.props.current.index !== nextProps.location.hash;
		const isNewHash =
			props.location.hash !== nextProps.location.hash && nextProps.location.hash.length;

		return { isNewPack, isNewNode, isNewHash };
	};

	shouldComponentUpdate(nextProps, nextState) {
		// TODO: this is no bueno - store shouldn't change if it didn't change, shallow compare should be enough
		const newCurrent = JSON.stringify(this.props.current) !== JSON.stringify(nextProps.current);
		const newIn = JSON.stringify(this.props.current.in) !== JSON.stringify(nextProps.current.in);
		const changedError = this.state.error !== nextState.error;
		const changedURL = this.props.match.params.universe !== nextProps.match.params.universe;
		const changedShowAdd = this.state.showAdd !== nextState.showAdd;
		const gotUniverse = JSON.stringify(this.props.universe) !== JSON.stringify(nextProps.universe);
		const gotPack = JSON.stringify(this.props.pack) !== JSON.stringify(nextProps.pack);
		const toggledData = this.state.showData !== nextState.showData;

		const shouldUpdate =
			newCurrent ||
			newIn ||
			changedError ||
			changedURL ||
			changedShowAdd ||
			gotUniverse ||
			toggledData ||
			gotPack;

		return shouldUpdate;
	}

	componentWillUnmount() {
		this._mounted = false;
		// reset body background to normal on unmount
		//setBodyStyle({ cssClass: "" });
	}

	// will set the history, and component will recieve the new props
	setIndex = (index, isDeleting) => {
		if (isNaN(index)) return;

		if (this.props.location.hash !== "#" + index) {
			this.props.history.push("#" + index);
		}
	};

	handleRestartExplore = () => {
		// reset universe
		// TODO: Do as action
		/*
		DB.fetch("explore", "DELETE")
			.then(() => DB.fetch(this.props.location.pathname))
			.then(({ err, data }) => {

				this.setIndex(data.index);
			});
		return;*/
	};

	handleRestartUniverse = (doRegenerate, universe) => {
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

	handleAdd = (label, event) => {
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

	doSort(inObjects = [], value) {
		if (!inObjects) return inObjects;

		// change from objects to indexes and remove new
		var inArr = inObjects
			.filter(c => c)
			.map(c => c && c.index)
			.filter((v = [], i, self) => {
				return self.indexOf(v) === i && !(v.includes && v.includes("NEW"));
			});
		var child = inArr[value.from];

		// do the move
		inArr.splice(value.from, 1);
		inArr.splice(value.to, 0, child);
		return inArr;
	}

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
			inArr = this.doSort(inArr, value);
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
		if (this.props.current.loading) return <div className="main pt-5">{LOADING}</div>;

		// get props
		const { current, isUniverse, index } = this.props,
			{ handleChange, handleAdd } = this,
			{ showData } = this.state,
			{ data, cssClass, up = [], icon, txt, in: inArr } = current,
			{ generators, tables } = getGensTables(this.props.pack),
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
							{isLoading && LOADING}
							<Children {...{ isUniverse, inArr, index, handleAdd, handleChange }} />
						</div>
					</div>
				</ExplorePage>
				{isUniverse && <Modals {...{ handleChange, index, icon, cssClass, txt, parent }} />}
			</>
		);
	}
}

function getGensTables(pack = {}, tables = []) {
	const { builtpack = {} } = pack;
	const { generators = [] } = builtpack;
	return {
		generators: Object.keys(generators)
			.concat(tables.map(t => `${t.title}::${t._id}::Table`))
			.sort()
	};
}
