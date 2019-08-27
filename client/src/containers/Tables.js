import React, { Component } from "react";
import { Switch } from "react-router-dom";
import PropTypes from "prop-types";

import DB from "util/DB";

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
