import React, { Component } from "react";
import { Switch } from "react-router-dom";
import PropTypes from "prop-types";

import DB from "../../actions/CRUDAction";
import { LOADING_GIF } from "../App";
import { PacksList, PackUL } from "../Packs";
import { PropsRoute, makeSubRoutes } from "../Routes";

/**
getData(props) {
	if (!props) props = this.props;
	if (!this.props.match.params) return;

	const universe =
		(props.match && props.match.params && props.match.params.universe) ||
		false;
	if (!this.state.loading) this.setState({ loading: true });

	if (universe && universe !== "create") {
		DB.get("universes", universe).then(({ error, data: universe }) => {
			this.setState({ error, universe, loading: false });

			if (universe && universe.pack) {
				DB.fetch(`builtpacks/${universe.pack._id}/generators`).then(
					({ error, data: generators }) => {
						this.setState({ error, generators });
					}
				);
				DB.fetch(`packs/${universe.pack._id}/tables`).then(
					({ error, data: tables }) => {
						this.setState({ error, tables });
					}
				);

				this.context.loadFonts(universe.pack.font);
			}
		});
	} else if (universe === "create") {
		DB.get("packs").then(({ error, data: packs }) =>
			this.setState({ error, packs, loading: false })
		);
	} else
		DB.get("universes").then(({ error, data: universes }) =>
			this.setState({ error, universes, loading: false })
		);
}**/

const UniverseListDisplay = ({
	universes: { loaded, array, error },
	packs,
	loggedIn
}) => {
	if (error) return error.display;

	return (
		<div className="main">
			<div className="container mt-5">
				<div className="universes">
					<h1>Universes</h1>
					{!loaded ? (
						LOADING_GIF
					) : error ? (
						error.display
					) : (
						<PackUL list={array} isUniverse={true} addButton={true} />
					)}
				</div>
				<PacksList {...packs} loggedIn={loggedIn} />
			</div>
		</div>
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
		if (oldname !== null && newname)
			gens.splice(gens.indexOf(oldname), 1, newname);
		else if (newname === null) gens.splice(gens.indexOf(newname), 1);
		else gens.unshift(newname);
	};

	render() {
		const {
			routes = [],
			match,
			universes,
			packs,
			loggedIn,
			loadFonts
		} = this.props;
		const {
			handleRenameGen,
			handleSortGens,
			handleRefresh,
			handleAdd,
			handleDelete,
			handleSave
		} = this;

		var content = (
			<div id="Universes">
				<Switch>
					{makeSubRoutes(routes, match.path, {
						handleSortGens,
						handleRefresh,
						handleRenameGen,
						handleAdd,
						handleDelete,
						handleSave,
						universes,
						packs,
						loggedIn,
						loadFonts
					})}
					<PropsRoute
						{...{ universes, packs, loggedIn }}
						component={UniverseListDisplay}
					/>
				</Switch>
			</div>
		);

		return content;
	}
}

export default Universes;
