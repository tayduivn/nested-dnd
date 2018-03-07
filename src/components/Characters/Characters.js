import React from "react";
import CharacterSettings from "./CharacterSettings";
import CharacterSheet from "./CharacterSheet/CharacterSheet";
import EditCharacter from "./EditCharacter";
import Cards from "./Cards";
import PackLoader from "../../util/PackLoader";

import characterStore from "../../stores/characterStore";

import { Row, Col, ListGroup, ListGroupItem, Tabs, Tab } from "react-bootstrap";

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
		let _this = this;
		PackLoader.load(() => {
			_this.setState({ characters: characterStore.getAll() });
		});
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
				<CharacterSettings />
				<Row>
					<Col sm={3} md={2} className="sidebar">
						<ListGroup className="characterList">
							{this.state.characters.map((c, i) =>
								<SidebarItem
									key={i}
									character={c}
									selected={this.state.selected.includes(c)}
									handleClick={this.selectDeselect}
								/>
							)}
						</ListGroup>
					</Col>
					<Col
						sm={9}
						smOffset={3}
						md={10}
						mdOffset={2}
						className="main"
					>
						<Tabs defaultActiveKey={3} id="characterInfo">
							<Tab eventKey={1} title="Edit">
								<EditCharacter
									{...this.getCharacterToEdit()}
									handleChange={this.updateCharacter}
								/>
							</Tab>
							<Tab eventKey={2} title="Sheet" />
							<Tab eventKey={3} title="Print Sheet">
								<div className="printme" id="charsheets">
									{this.state.selected.map((c, i) =>
										<CharacterSheet key={i} character={c} />
									)}
								</div>
							</Tab>
							<Tab eventKey={4} title="Print Cards">
								<div className="printme" id="cardSheets">
									{this.state.selected.map((c, i) =>
										<Cards key={i} character={c} />
									)}
								</div>
								<Cards />
							</Tab>
						</Tabs>
					</Col>
				</Row>
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
			<ListGroupItem
				active={this.props.selected}
				onClick={this.handleClick}
			>
				<div className="pull-right">
					<strong>{c.getTotalLevel()}</strong>
				</div>
				<p className="charName">{c.name ? c.name : c.classes[0].name}</p>
				<p className="playerName">{c.player}</p>
			</ListGroupItem>
		);
	}
}