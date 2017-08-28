import React from 'react';

class ThingChoice extends React.Component{
	constructor(props){
		super(props);
		this.handleClick = this.handleClick.bind(this)
	}

	handleClick(thing){
		this.props.selectFunc(thing)
	}
	render(){
		var t = this.props.thing;
		var curr = this.props.currentThing;
		t.processIsa();
		var icon = t.icon;
		if(icon.roll) icon = icon[0];

		return (
			<button className={"list-group-item "+((curr === t) ? "active":"")}
				onClick={() => this.props.selectFunc(this.props.thing)}>
				<h4 className="no-margin"><i className={icon}></i> {t.name}</h4>
				{t.isa}
			</button>
		)
	}
}

export default ThingChoice;