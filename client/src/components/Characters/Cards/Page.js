import React from "react";

import ItemFront from './ItemFront';
import ItemBack from './ItemBack';
import SpellFront from './SpellFront';
import SpellBack from './SpellBack';

const Spell = ({index, card})  => (
	<div className="card-wrap" key={index}>
		<SpellFront spell={card} />
		<SpellBack spell={card} />
		<br />
	</div>
)

const Item = ({index, card}) => (
	<div className="card-wrap" key={index}>
		<ItemFront item={card} />
		<ItemBack item={card} />
		<br />
	</div>
)

export default class Page extends React.Component {
	render() {
		var cards = this.props.cards.map(function(card, index) {
			if (!card) {
				return <div className="card blank" key={index} />;
			}
			else if (card.category === "Spells") {
				return <Spell index={index} card={card} />;
			}
			else {
				return <Item index={index} card={card} />
			}
		});
		return (
			<div className="paper landscape">
				<div className="cardsName">{this.props.name}</div>	
				{cards}
			</div>
		);
	}
}