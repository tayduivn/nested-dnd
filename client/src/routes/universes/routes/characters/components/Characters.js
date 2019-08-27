import React from "react";
import Link from "components/Link";

import DB from "util/DB";
import ImportFromDDB from "./ImportFromDDB";
import { ddbConvert } from "../util/DDB";

import "./Characters.scss";

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
		//DB.fetch("/universes/" + this.props.universe_id + "/characters").then(r => this.setState(r));
	}
	render() {
		if (this.state.error) return this.state.error.display;

		return <Display {...this.state} handleUpdate={this.handleUpdate} />;
	}
}

export { ImportFromDDB };
