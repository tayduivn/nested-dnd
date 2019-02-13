import React, { Component } from "react";
import { Link, Switch } from "react-router-dom";
import PropTypes from "prop-types";
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

		DB.create("pack/" + PACK_ID + "/table", payload).then(({ error, data: table }) => {
			if (error) return this.setState({ error });
			this.setState({ table, isCreate: false });

			var newURL = PATHNAME.replace("/create", "/" + table._id + "/edit");

			this.props.history.replace(newURL);
		});
	};

	render() {
		return (
			<div id="Tables" className="main">
				<div className="container mt-5">
					<Switch />
				</div>
			</div>
		);
	}
}

//{makeSubRoutes(routes, match.path, { pack, handleAdd })}

class TablesList extends Component {
	static propTypes = {
		isOwner: PropTypes.bool,
		tables: PropTypes.array
	};

	render() {
		const { isOwner, tables, packurl } = this.props;
		const state = { packurl, tables };

		return (
			<div>
				<h2>Tables</h2>
				{!isOwner ? null : (
					<Link to={`${packurl}/tables/create`} state={state}>
						<button className="btn btn-primary">Add Table</button>
					</Link>
				)}
				<ul>
					{tables.map((t, i) => (
						<li key={i}>
							<Link to={`${packurl}/tables/${t._id}/edit`} state={state}>
								{t.title}{" "}
							</Link>
							<em>{t.returns}</em>
						</li>
					))}
				</ul>
			</div>
		);
	}
}

export { TablesList };
