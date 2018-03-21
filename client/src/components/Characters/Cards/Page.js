import React from "react";

import ItemFront from './ItemFront';
import ItemBack from './ItemBack';
import SpellFront from './SpellFront';
import SpellBack from './SpellBack';

export default class Page extends React.Component {
	render() {
		var cards = [];
		this.props.cards.forEach(function(card, index) {
			if (!card) return <div className="card blank" key={index} />;
			else if (card.category === "Spells") {
				cards.push(
					<div className="card-wrap" key={index}>
						<SpellFront spell={card} />
						<SpellBack spell={card} />
						<br />
					</div>
				);
			} else if (card.category === "Items") {
				cards.push(
					<div className="card-wrap" key={index}>
						<ItemFront item={card} />
						<ItemBack item={card} />
						<br />
					</div>
				);
			}
		});
		return (
			<div className="paper  landscape">
				<div className="cardsName">{this.props.name}</div>	
				{cards}
			</div>
		);
	}
}
