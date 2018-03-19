import React from "react";
import CharacterSheet from "./CharacterSheet/CharacterSheet";
import Cards from "./Cards";

import characterStore from "../../stores/characterStore";

import "./Characters.css";

export default class Characters extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			characters: [],
			selected: []
		};
		this.selectDeselect = this.selectDeselect.bind(this);
		this.updateCharacter = this.updateCharacter.bind(this);
	}
	componentDidMount() {
		// let _this = this;
		/*PackLoader.load(() => {
			_this.setState({ characters: characterStore.getAll() });
		});*/
	}
	selectDeselect(character, selected) {
		var index = this.state.selected.indexOf(character);
		if (selected && index === -1) {
			this.setState({
				selected: [...this.state.selected, character]
			});
		} else if (!selected && index !== -1) {
			var characters = this.state.selected;
			characters.splice(index, 1);
			this.setState({
				selected: characters
			});
		}
	}
	updateCharacter(index, raw) {
		characterStore.update(index, raw);
		var characters = characterStore.getAll();
		this.setState({
			characters: characters,
			selected: [characters[index]]
		});
	}
	getCharacterToEdit() {
		var index = this.state.characters.indexOf(this.state.selected[0]);
		return {
			index: index,
			character: characterStore.getRaw(index)
		};
	}
	render() {
		return (
			<div className="container-fluid">
				<div className="row">
					<div className="col-sm-3 col-md-2 sidebar">
						<ul className="list-group characterList">
							{this.state.characters.map((c, i) =>
								<SidebarItem
									key={i}
									character={c}
									selected={this.state.selected.includes(c)}
									handleClick={this.selectDeselect}
								/>
							)}
						</ul>
					</div>
					<div className="col-sm-9 col-md-9 offset-sm-3 offset-md-2 main">
						<ul id="characterInfo" className="nav nav-tabs">
							<li class="nav-item" eventKey={2} title="Sheet" />
							<li class="nav-item" eventKey={3} title="Print Sheet">
								<div className="printme" id="charsheets">
									{this.state.selected.map((c, i) =>
										<CharacterSheet key={i} character={c} />
									)}
								</div>
							</li>
							<li eventKey={4} title="Print Cards">
								<div className="printme" id="cardSheets">
									{this.state.selected.map((c, i) =>
										<Cards key={i} character={c} />
									)}
								</div>
								<Cards />
							</li>
						</ul>
					</div>
				</div>
			</div>
		);
	}
}

class SidebarItem extends React.Component {
	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}
	handleClick() {
		this.props.handleClick(this.props.character, !this.props.selected);
	}
	render() {
		let c = this.props.character;
		return (
			<ul className="list-group"
				active={this.props.selected}
				onClick={this.handleClick}
			>
				<div className="pull-right">
					<strong>{c.getTotalLevel()}</strong>
				</div>
				<p className="charName">{c.name ? c.name : c.classes[0].name}</p>
				<p className="playerName">{c.player}</p>
			</ul>
		);
	}
}