import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export default class TablesList extends Component {
	static propTypes = {
		isOwner: PropTypes.bool,
		tables: PropTypes.array
	};

	render() {
		const { isOwner, tables = [], packUrl } = this.props;
		const state = { packUrl, tables };
		return (
			<>
				{!isOwner ? null : (
					<Link to={`/packs/${packUrl}/tables/create`} state={state}>
						<button className="btn btn-primary">Add Table</button>
					</Link>
				)}
				<ul>
					{tables
						? tables.map((t, i) => (
								<li key={i}>
									<Link to={`/packs/${packUrl}/tables/${t._id}/edit`} state={state}>
										{t.title}{" "}
									</Link>
									<em>{t.returns}</em>
								</li>
						  ))
						: null}
				</ul>
			</>
		);
	}
}
