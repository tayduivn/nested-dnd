import React from "react";

import { recalcFontSize, CARDS_PER_PAGE } from "./CardsUtil";
import Page from "./Page";

import "./Cards.css";

function fixFontSize() {
	var arr = document.getElementsByClassName("desc");
	for (var i = 0; i < arr.length; i++) {
		arr[i].style.fontSize = "14px";
		recalcFontSize(arr[i]);
	}
}

export default class Cards extends React.Component {
	componentDidMount() {
		document.querySelectorAll('a[data-toggle="tab"]').forEach(el => {
			el.addEventListener("shown.bs.tab", fixFontSize);
		});
	}
	componentDidUpdate() {
		fixFontSize();
	}
	render() {
		if (!this.props.character || !this.props.character.cards) return <div />;

		var pages = [],
			cards = [];
		let c = this.props.character;
		const ALL_CARDS = c.cards;
		var name = c.name ? c.name : c.classes[0].name;
		name += " " + c.level;

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
			<div id="cardSheets" className="printme py-4">
				{pages}
			</div>
		);
	}
}
