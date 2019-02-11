import React from "react";
import { Link } from "../Util";

import DB from "../../actions/CRUDAction";
import { ddbConvert } from "../../actions/DDB";

import "./Characters.css";

const CharacterItem = c => (
	<Link to={`/characters/${c._id}`} state={c}>
		<li>
			<div className="pull-right">
				<strong>{c.level}</strong>
			</div>
			<p className="charName">{c.name ? c.name : c.classes[0].name}</p>
			<p className="playerName">{c.player}</p>
		</li>
	</Link>
);

const CharactersList = ({ characters = [] }) => (
	<ul className="list-group characterList">
		{characters.map ? characters.map((c, i) => <CharacterItem key={i} {...c} />) : null}
	</ul>
);

const ImportFromDDB = ({ handleUpdate }) => (
	<form onSubmit={handleUpdate}>
		<div className="form-group">
			<label htmlFor="ddbData">Import from D&D Beyond</label>
			<textarea
				className="form-control"
				id="ddbData"
				name="ddbData"
				placeholder='Go to your D&D Beyond character page, add "/json" to the end of the URL, and copy/paste the data here. For example: https://www.dndbeyond.com/profile/username/characters/0000000/json'
			/>
			<button type="submit" className="btn btn-primary mt-1">
				Import
			</button>
		</div>
	</form>
);

const Display = ({ data: characters, handleUpdate }) => (
	<div>
		<CharactersList characters={characters} />
		<ImportFromDDB handleUpdate={handleUpdate} />
	</div>
);

export default class Characters extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			error: undefined,
			data: []
		};
	}

	handleUpdate = e => {
		e.preventDefault();
		var data = new FormData(e.currentTarget).get("ddbData");
		var newData = ddbConvert(data);
		const _this = this;
		DB.create("/universes/" + this.props.universe_id + "/characters", newData).then(r => {
			_this.setState({
				error: r.error,
				data: _this.state.data.concat([r.data])
			});
		});
	};

	componentDidMount() {
		DB.fetch("/universes/" + this.props.universe_id + "/characters").then(r => this.setState(r));
	}
	render() {
		if (this.state.error) return this.state.error.display;

		return <Display {...this.state} handleUpdate={this.handleUpdate} />;
	}
}

export { ImportFromDDB };
