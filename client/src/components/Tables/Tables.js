import React, { Component } from "react";
import { Link, Switch } from "react-router-dom";
import PropTypes from "prop-types";

import { makeSubRoutes } from "../Routes";
import DB from "../../actions/CRUDAction";

export default class Tables extends Component {
	static propTypes = {
		location: PropTypes.object,
		routes: PropTypes.array,
		match: PropTypes.object,
		pack: PropTypes.object
	};

	handleAdd = title => {
		var payload = {
			title: title
		};
		const PACK_ID = this.props.pack._id;
		const PATHNAME = this.props.location.pathname;

		DB.create("pack/" + PACK_ID + "/table", payload).then(
			({ error, data: table }) => {
				if (error) return this.setState({ error });
				this.setState({ table, isCreate: false });

				var newURL = PATHNAME.replace("/create", "/" + table._id + "/edit");

				this.props.history.replace(newURL);
			}
		);
	};

	render() {
		const { routes, match, pack } = this.props;
		const { handleAdd } = this;

		return (
			<div id="Tables" className="main">
				<div className="container mt-5">
					<Switch>
						{makeSubRoutes(routes, match.path, { pack, handleAdd })}
					</Switch>
				</div>
			</div>
		);
	}
}

class TablesList extends Component {
	static propTypes = {
		isOwner: PropTypes.bool,
		tables: PropTypes.array,
		match: PropTypes.object
	};

	render = () => {
		const { isOwner, tables, match } = this.props;
		const state = { packid: match.params.pack, tables };

		return (
			<div>
				<h2>Tables</h2>
				{!isOwner ? null : (
					<Link to={`${match.url}/tables/create`} state={state}>
						<button className="btn btn-primary">Add Table</button>
					</Link>
				)}
				<ul>
					{tables.map((t, i) => (
						<li key={i}>
							<Link to={`${match.url}/tables/${t._id}/edit`} state={state}>
								{t.title}{" "}
							</Link>
							<em>{t.returns}</em>
						</li>
					))}
				</ul>
			</div>
		);
	};
}

export { TablesList };
