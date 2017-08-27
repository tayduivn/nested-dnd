import React, { Component } from 'react';
import { Button, Modal } from 'react-bootstrap';
import Thing from './Thing.js';
import Table from './Table.js';

function uniq(a) {
	var prims = {"boolean":{}, "number":{}, "string":{}}, objs = [];

	return a.filter(function(item) {
			var type = typeof item;
			if(type in prims)
					return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
			else
					return objs.indexOf(item) >= 0 ? false : objs.push(item);
	});
}

class IconList extends React.Component{
	render(){
		var icons = [];
		var matches = this.props.matches;
		for(var name in matches){
			icons.push(
				<div key={"matches "+name}>
					<strong>{name} ({Thing.get(name).isa})</strong>
					<h1>{uniq(matches[name]).map((icon) => <i key={icon} title={icon} className={icon} />)}</h1>
					<p>
						"{name}"{": { \"icon\":"}{ 
							(matches[name].length > 1) ?  "[\""+matches[name].join("\",\"")+"\"]" : "\""+matches[name][0]+"\""
						}{"},"}
					</p>
				</div>
			)
		}
		return (<div>{icons}</div>);
	}
}

class IconDebug extends React.Component{
	constructor(props){
		super(props);
		if(this.props.show === true){
			this.results = this.findIcons()
			this.state = {show:true};
		}
		else
			this.state = {show:false};
	}
	close() {
		this.setState({ show: false });
	}

	open() {
		this.setState({ show: true });
	}

	findIcons(){
		if(!Table.isTableID("*GAME ICONS*"))
			return;

		var gameicons = Table.get("GAME ICONS");
		var faicons = Table.get("FONTAWESOME ICONS");
		
		var matches = {};
		var nearMatches = {};
		var nameGenMatches = {};
		var things = Thing.getThings();

		//msg+="\""+name+"\": { \"icon\": \"gi gi-dragon-head\" },\n";

		Thing.filter("dragon").forEach(function(name){
			if(!things[name].icon)
				matches[name] = ["gi gi-dragon-head","gi gi-double-dragon"];
		});
		Thing.filter("thoughts").forEach(function(name){
			if(!things[name].icon)
				matches[name] = ["fa flaticon-interface"];
		});
		Thing.filter("psyche").forEach(function(name){
			if(!things[name].icon)
				matches[name] = ["fa flaticon-interface"];
		});
		Thing.filter("shop").forEach(function(name){
			if(!things[name].icon)
				matches[name] = ["gi gi-shop"];
		});

		for(var thingName in things){
			var t = things[thingName];
			if(t.icon) continue;

			gameicons.filter((icon) => icon.split("-").includes(t.name))
				.forEach((icon) => {
					if(!matches[t.name]) matches[t.name] = [];
					matches[t.name].push("gi gi-"+icon+"");
				});

			faicons.filter((icon) => icon.split("-").includes(t.name))
				.forEach((icon) => {
					if(!matches[t.name]) matches[t.name] = [];
					matches[t.name].push("fa fa-"+icon+"");
				});

			gameicons.filter((icon) => icon.includes(t.name))
				.forEach((icon) => {
					if(!nearMatches[t.name]) nearMatches[t.name] = [];
					nearMatches[t.name].push("gi gi-"+icon+"");
				});

			faicons.filter((icon) => icon.includes(t.name))
				.forEach((icon) => {
					if(!nearMatches[t.name]) nearMatches[t.name] = [];
					nearMatches[t.name].push("fa fa-"+icon+"");
				});

			if(t.namegen instanceof Array){
				t.namegen.forEach((choice) => {
					if(typeof choice !== "string") return;
					gameicons.filter((icon) => icon.split("-").includes(choice))
						.forEach((icon) => {
							if(!nameGenMatches[t.name]) nameGenMatches[t.name] = [];
							nameGenMatches[t.name].push("gi gi-"+icon+"");
						});

					faicons.filter((icon) => icon.split("-").includes(choice))
						.forEach((icon) => {
							if(!nameGenMatches[t.name]) nameGenMatches[t.name] = [];
							nameGenMatches[t.name].push("fa fa-"+icon+"");
						});
				})
			}
		}

		var msg = "MATCHED ICONS: \n ------------------------ \n";
		for(var name in matches){
			if(matches[name].length > 1)
				msg+="\""+name+"\": { \"icon\": ["+matches[name].join(",")+"] },\n";
			else
				msg+="\""+name+"\": { \"icon\": "+matches[name][0]+" },\n";
		}

		msg+= "NEAR MATCHED ICONS: \n ------------------------ \n";
		for(var name in nearMatches){
			if(nearMatches[name].length > 1)
				msg+="\""+name+"\": { \"icon\": ["+nearMatches[name].join(",")+"] },\n";
			else
				msg+="\""+name+"\": { \"icon\": "+nearMatches[name][0]+" },\n";
		}

		msg+= "NAMEGEN MATCHED ICONS: \n ------------------------ \n";
		for(var name in nameGenMatches){
			if(nameGenMatches[name].length > 1)
				msg+="\""+name+"\": { \"icon\": ["+nameGenMatches[name].join(",")+"] },\n";
			else
				msg+="\""+name+"\": { \"icon\": "+nameGenMatches[name][0]+" },\n";
		}
		console.log(msg);

		return {
			msg:msg,
			matches:matches,
			nearMatches:nearMatches,
			nameGenMatches:nameGenMatches
		}
	}
	render(){
		if(!this.results) return <span></span>;
		
		return (<Modal show={this.state.show} 
				onHide={() => this.close()}>
				<Modal.Header>
					<Modal.Title>Icon Debug</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<IconList matches={this.results.matches} />
					<IconList matches={this.results.nearMatches} />
					<IconList matches={this.results.nameGenMatches} />
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={() => this.close()}>Close</Button>
				</Modal.Footer>
		</Modal>)
	}
}

export {IconDebug,uniq};
