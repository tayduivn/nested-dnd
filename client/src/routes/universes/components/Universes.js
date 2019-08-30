import React, { Component } from "react";
import PropTypes from "prop-types";

import DB from "util/DB";
import Loading from "components/Loading";
import PacksList from "components/PacksList";
import PackUL from "components/PackUL";
import Page from "components/Page";

const UniverseListDisplay = ({
	universes: { loaded, array, error } = {},
	packs,
	loggedIn,
	dispatch
}) => {
	if (error) return error.display;

	return (
		<Page>
			<div className="universes">
				<h1>Universes</h1>
				{!loaded ? (
					<Loading.Icon />
				) : error ? (
					error.display
				) : (
					<PackUL list={array} isUniverse={true} addButton={true} dispatch={dispatch} />
				)}
			</div>
			<PacksList {...packs} loggedIn={loggedIn} dispatch={dispatch} />
		</Page>
	);
};

class Universes extends Component {
	static propTypes = {
		match: PropTypes.object,
		universes: PropTypes.object,
		packs: PropTypes.object,
		loggedIn: PropTypes.bool
	};
	static defaultProps = {
		match: { params: {} }
	};
	componentDidMount() {
		if (this.props.match.isExact) this.props.loadUniverses(this.props);
	}

	componentDidUpdate(previProps) {
		if (!this.props.match.params) return;

		// universe change
		//const { universe: updated } = this.props.match.params;
		//const { universe: current } = previProps.match.params;
		// if (current !== updated) this.getData(this.props);
	}
	shouldComponentUpdate(nextProps) {
		const loggedInState = nextProps.loggedIn !== this.props.loggedIn;
		const changedUnis =
			JSON.stringify(nextProps.universes) !== JSON.stringify(this.props.universes);
		const changedPacks = JSON.stringify(nextProps.packs) !== JSON.stringify(this.props.packs);
		const url = JSON.stringify(nextProps.location) !== JSON.stringify(this.props.location);

		return loggedInState || changedUnis || changedPacks || url;
	}

	handleSave = e => {
		if (!this.props.match.params) return;
		e.preventDefault();
		var formData = new FormData(e.target);
		const id = this.props.match.params.universe;

		DB.set("universes", id, formData).then(result => {
			this.setState(result);
			this.props.history.goBack();
		});
	};

	handleDelete = () => {
		if (!this.props.match.params) return;

		const id = this.props.match.params.universe;
		DB.delete("universes", id).then(({ error, doc }) => {
			if (error) this.setState({ error: error });
			else this.props.history.goBack();
		});
	};

	handleAdd = (event, selectedPack) => {
		event.preventDefault();
		var fd = new FormData(event.target);
		fd.set("pack", selectedPack);
		var _this = this;

		DB.create("universes", fd).then(({ error, data }) => {
			if (error) return _this.setState({ error, data });
			_this.props.history.push(`/universes/${data._id}/explore`);
		});
	};

	handleRefresh = () => {
		const universe = this.props.match.params.universe;
		DB.get("universes", universe).then(result => this.setState(result));
	};

	/**
	 * Move a generator to the top of the stack
	 */
	handleSortGens = gen => {
		var gens = this.state.generators;
		var genOrder = gens.indexOf(gen);
		if (genOrder !== -1) {
			gens.splice(genOrder, 1);
			gens.unshift(gen);
			this.setState({ generators: gens });
		}
	};

	handleRenameGen = (oldname, newname) => {
		var gens = this.state.generators;
		if (!gens) return;
		if (oldname !== null && newname) gens.splice(gens.indexOf(oldname), 1, newname);
		else if (newname === null) gens.splice(gens.indexOf(newname), 1);
		else gens.unshift(newname);
	};

	getData = () => {
		const { universes, packs, loggedIn, loadFonts } = this.props;

		return {
			handleSortGens: this.handleSortGens,
			handleRefresh: this.handleRefresh,
			handleRenameGen: this.handleRenameGen,
			handleAdd: this.handleAdd,
			handleDelete: this.handleDelete,
			handleSave: this.handleSave,
			universes,
			packs,
			loggedIn,
			loadFonts
		};
	};
	render() {
		const { universes, packs, loggedIn, dispatch } = this.props;

		var content = <UniverseListDisplay {...{ universes, packs, loggedIn, dispatch }} />;

		return content;
	}
}

export default Universes;
