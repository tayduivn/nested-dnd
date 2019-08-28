import React from "react";
import Sifter from "sifter";
import "./SearchBar.scss";

export default class SearchBar extends React.Component {
	state = {
		query: "",
		matches: []
	};
	constructor(props) {
		super(props);
		this.sifter = new Sifter(props.favorites);
	}
	componentDidUpdate(prevProps) {
		if (this.props.favorites !== prevProps.favorites) {
			this.sifter = new Sifter(this.props.favorites);
		}
	}
	shouldComponentUpdate(nextProps, nextState) {
		const quer = this.state.query !== nextState.query;
		const favs = JSON.stringify(this.props.favorites) !== JSON.stringify(nextProps.favorites);
		const index = this.props.index !== nextProps.index;
		return quer || favs || index;
	}
	clearQuery = () => {
		this.setState({ query: "", matches: [] });
	};
	handleChange = e => {
		var query = e.target.value;

		let matches = { items: [] };
		if (query.length) {
			matches = this.sifter.search(query, { fields: ["name"], limit: 20 });
		}
		const m = matches.items.map(({ id }) => this.props.favorites[id]);

		this.setState({ query, matches: m });
	};
	render() {
		return (
			<div className="dropdown search-bar">
				<input
					value={this.state.query}
					className="form-control dropdown__input search-bar__input"
					onChange={this.handleChange}
					placeholder="★ search favorites"
				/>
				<ul className={`dropdown__menu search-bar__dropdown --open`}>
					{this.state.query &&
						this.state.matches.map(f => (
							<a key={f.index} href={"#" + f.index} onClick={this.clearQuery}>
								<li className="dropdown__option search-bar__option">{f.name}</li>
							</a>
						))}
				</ul>
			</div>
		);
	}
}
