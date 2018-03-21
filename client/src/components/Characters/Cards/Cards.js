import React from "react";

import { recalcFontSize, CARDS_PER_PAGE } from './CardsUtil'
import Page from './Page';

import "./Cards.css";

export default class Cards extends React.Component {
	componentDidUpdate() {
		var arr = document.getElementsByClassName("desc");
		for (var i = 0; i < arr.length; i++) {
			arr[i].style.fontSize = "14px";
			recalcFontSize(arr[i]);
		}
	}
	render() {
		if (!this.props.character || !this.props.character.cards)
			return <div />;

		var pages = [];
		const ALL_CARDS = this.props.character.cards.get();
		let c = this.props.character;
		const LVL = c.getTotalLevel();
		let name = (c.name) ? c.name+" "+LVL: c.classes[0].name+" "+LVL;
		pages.push();

		var cards = [];

		for (var i = 0; i < ALL_CARDS.length; i++) {
			cards.push(ALL_CARDS[i]);
			if (
				cards.length === CARDS_PER_PAGE ||
				(ALL_CARDS.length && i === ALL_CARDS.length - 1)
			) {
				pages.push(
					<Page cards={cards} side="front" key={pages.length} name={name} />
				);
				cards = [];
			}
		}
		return (
			<div>
				{pages}
			</div>
		);
	}
}