import React, { Component } from "react";
import { Switch } from "react-router-dom";
import PropTypes from "prop-types";

import DB from "../../actions/CRUDAction";
import { LOADING_GIF } from "../App/App";
import { makeSubRoutes } from "../Routes";

import async from "async";

/**
 * /tables/${id}
 */
export default class Table extends Component {
	static propTypes = {
		match: PropTypes.object,
		pack: PropTypes.object,
		isCreate: PropTypes.bool
	};

	state = {
		table: undefined,
		error: undefined
	};

	componentDidMount() {
		const tableid = this.props.match.params.table;

		if (tableid) {
			DB.get("tables", tableid).then(({ error, data: table }) =>
				this.setState({ table, error })
			);
		}
	}

	handleChange = (property, value) => {
		this.saver.push({ [property]: value });
	};

	handleDelete = () => {
		const TABLE_ID = this.props.match.params.table;

		DB.delete("tables", TABLE_ID).then(({ error, data }) => {
			if (error) return this.setState({ error });
			this.props.history.goBack();
		});
	};

	saver = async.cargo((tasks, callback) => {
		// we are updating a table with an ID directly
		var payload = {};
		tasks.forEach(t => {
			payload = { ...payload, ...t };
		});

		DB.set("tables", this.props.match.params.table, payload)
			.then(({ error }) => this.setState({ error }))
			.then(callback);
	});

	// get the table if you haven't already

	render() {
		const { handleDelete, handleChange } = this;
		const { routes, match, pack, isCreate } = this.props;
		const { table } = this.state;

		var content;

		if (this.state.error)
			content = <div className="main">{this.state.error.display}</div>;
		else if (!table && !isCreate)
			content = <div className="main">{LOADING_GIF}</div>;
		else {
			content = (
				<Switch>
					{makeSubRoutes(routes, match.path, {
						table,
						handleDelete,
						handleChange,
						isCreate,
						pack,
						id: table._id
					})}
				</Switch>
			);
		}
		return <div id="Table">{content}</div>;
	}
}
