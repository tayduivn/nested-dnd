import React from "react";
import WebFont from "webfontloader";

import CharacterSheet from "./CharacterSheet/CharacterSheet";
import Cards from "./Cards/Cards";
import DB from "../../actions/CRUDAction";
import { LOADING_GIF } from "../App/App";
import { ImportFromDDB } from "./Characters";
import { ddbConvert } from "../../actions/DDB";

const Display = ({ character, handleUpdate }) => (
	<div className="main">
		<div className="container-fluid">
			<ul className="nav nav-tabs" role="tablist">
				<li className="nav-item">
					<a
						className="nav-link active"
						id="charsheets-tab"
						href="#charsheets"
						data-toggle="tab"
						aria-controls="charsheets"
						aria-selected="true"
						role="tab"
					>
						Print Sheet
					</a>
				</li>
				<li className="nav-item">
					<a
						className="nav-link"
						id="cards-tab"
						href="#cards"
						data-toggle="tab"
						aria-controls="cards"
						aria-selected="false"
						role="tab"
					>
						Print Cards
					</a>
				</li>
				<li className="nav-item">
					<a
						className="nav-link"
						id="edit-tab"
						href="#edit"
						data-toggle="tab"
						aria-controls="edit"
						aria-selected="false"
						role="tab"
					>
						Edit
					</a>
				</li>
			</ul>
			<div className="tab-content pt-0">
				<div
					className="tab-pane fade show active"
					id="charsheets"
					role="tabpanel"
					aria-labelledby="charsheets-tab"
				>
					<div className="printme py-4">
						<CharacterSheet character={character} />
					</div>
				</div>
				<div
					className="tab-pane fade"
					id="cards"
					role="tabpanel"
					aria-labelledby="cards-tab"
				>
					<Cards character={character} />
				</div>
				<div
					className="tab-pane fade"
					id="edit"
					role="tabpanel"
					aria-labelledby="edit-tab"
				>
					<ImportFromDDB handleUpdate={handleUpdate} />
				</div>
			</div>
		</div>
	</div>
);

export default class Character extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			error: undefined,
			data: props.location.state && props.location.state.character
		};
	}

	handleUpdate = e => {
		e.preventDefault();
		var data = new FormData(e.currentTarget).get("ddbData");
		var newData = ddbConvert(data);
		console.log(newData);
		DB.set("characters", this.props.match.params.character, newData).then(r =>
			this.setState(r)
		);
	};

	componentDidMount() {
		DB.get("characters", this.props.match.params.character).then(r =>
			this.setState(r)
		);

		WebFont.load({
			google: {
				families: ["EB Garamond"]
			}
		});
	}

	render() {
		if (this.state.error)
			return <div className="main">{this.state.error.display}</div>;

		if (!this.state.data) return <div className="main">{LOADING_GIF}</div>;

		return (
			<Display character={this.state.data} handleUpdate={this.handleUpdate} />
		);
	}
}
