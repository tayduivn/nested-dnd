import React from "react";
import PropTypes from "prop-types";

import DB from "util/DB";
import GeneratorsList from "containers/GeneratorsList";

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
		const pack_id = this.props.match.params.pack;

		// TODO: Do as action
		DB.create("packs/" + pack_id + "/generators", payload).then(({ error, data: generator }) => {
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
