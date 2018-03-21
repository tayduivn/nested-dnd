import React from "react";

import ItemFront from './ItemFront';
import ItemBack from './ItemBack';
import SpellFront from './SpellFront';
import SpellBack from './SpellBack';

export default class Page extends React.Component {
	renderFrontBack() {
		var side = this.props.side;
		var len = this.props.cards.length;
		this.props.cards.length = 9;
		this.props.cards.fill(false, len, 9);
		if (side === "back") {
			var c1 = this.props.cards.splice(0, 1, this.props.cards[2]);
			var c4 = this.props.cards.splice(3, 1, this.props.cards[5]);
			var c7 = this.props.cards.splice(6, 1, this.props.cards[8]);
			this.props.cards.splice(2, 1, c1[0]);
			this.props.cards.splice(5, 1, c4[0]);
			this.props.cards.splice(8, 1, c7[0]);
		}
		var cards = this.props.cards.map(function(card, index) {
			if (!card) return <div className="card blank" key={index} />;
			if (card.category === "Items") {
				if (side === "front")
					return <ItemFront item={card} key={index} />;
				if (side === "back")
					return <ItemBack item={card} key={index} />;
			}
			if (card.category === "Spells") {
				if (side === "front")
					return <SpellFront spell={card} key={index} />;
				if (side === "back")
					return <SpellBack spell={card} key={index} />;
			}
			return <span key={index} />;
		});
		return (
			<div className="paper landscape">
				{cards}
			</div>
		);
	}
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
