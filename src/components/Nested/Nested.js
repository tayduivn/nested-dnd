import React from 'react';
import { CSSTransitionGroup } from 'react-transition-group'

import thingStore from '../../stores/thingStore.js';
import instanceStore from '../../stores/instanceStore.js'
import PackLoader from '../../util/PackLoader.js';
import Ancestors from './Ancestors.js';

import './Nested.css';

var currentInstanceId = null;

class Nested extends React.Component {
	constructor(){
		super();
		this.state = {
			instance: null
		};
	}
	//if user updates the hash or clicks the navbar this will fire
	componentWillUpdate(){
		var id = parseInt(window.location.hash.replace('#',''),10);
		if(id && this.state.instance && this.state.instance.id !== id){
			this.setInstance(id);
		}
		else{
			
		}
	}
	//set hash to root onload
	componentWillMount(){
		var _this = this;

		if(currentInstanceId){
			this.setState({instance: instanceStore.get(currentInstanceId)})
			window.location.hash = "#"+currentInstanceId;
		}
		else{
			PackLoader.load(function(packs){
				var hash = _this.getSeed(packs)
				window.location.hash = "#"+hash;

				//handle back button
				window.addEventListener('hashchange',_this.handleUrlChange);
			});
		}
	}
	componentWillUnmount(){
		currentInstanceId = (this.state.instance) ? this.state.instance.id : null;
		window.removeEventListener('hashchange',this.handleUrlChange);
	}
	handleUrlChange(){
		var id = parseInt(window.location.hash.replace('#',''),10);

		var _this = this;
		setTimeout(function(){
			if(_this.state && _this.state.instance.id !== id){
				_this.setInstance(id);
			}
		},10);
	}
	getSeed(packs){
		var seed = localStorage["seed"];

		seed = seed.split(">");
		if(seed.length === 1){
			if(instanceStore.get(0)){
				return this.setInstance(0);
			}

			seed = seed[0];
			if(!thingStore.exists(seed)){
				localStorage["seed"] = seed = packs.defaultSeed;
			}
			return this.setInstance(instanceStore.add(thingStore.get(seed)).id);
		}

		var parent,current;
		for(var i = 0, name; i < seed.length; i++){
			name = seed[i].trim();
			if(!thingStore.exists(name)){
				console.error("can't find thing "+name)
				seed = false;
				break;
			}
			if(parent){
				current = parent.findChild(name);
			}
			else if(instanceStore.get(0))
				return this.setInstance(0);
			else{
				current = instanceStore.add(thingStore.get(name));
			}
			console.log("loaded "+current.name);
			parent = current;
		}
		return this.setInstance(current.id);
	}
	setInstance(index, zoomOut){
		//toggleAnimation(document.getElementsByClassName("child"));

		/*document.getElementById("contains").className = "row animated "+(zoomOut?"zoomOutRight":"zoomOutLeft");*/
		if(isNaN(index)){
			var currID = this.state.instance.id;
			if(this.state.instance && window.location.hash !== "#"+currID){
				window.history.pushState(null, null, '#'+currID);
			}
			return;
		}
		
		if(window.location.hash !== "#"+index){
			window.history.pushState(null, null, '#'+index);
		}

		var instance = instanceStore.get(index);
		if(!instance.grown){
			instance.grow();
		}
		instance.thing.beforeRender(instance);
		
		/*;
		document.getElementById("contains").className = "row animated "+(zoomOut?"slideInLeft":"slideInRight");*/
		if(document.getElementById("title"))
			document.getElementById("title").className="animated fadeIn";

		this.setState({"instance": instance});

		return instance.id;
	}
	render() {
		if(!this.state.instance)
			return <p>LOADING</p>
		var inst = this.state.instance;
		return (
			<div id="content"  data-thing={inst.thing.name} className={"container-fluid "+inst.cssClass} style={{color:inst.textColor}}>
					<h1 id="title" key={inst.name} >
						<Ancestors parent={inst.parent} page={this} />    <i className={inst.icon}></i> {inst.name}
					</h1>
						<CSSTransitionGroup id="contains" className="row auto-clear"
							transitionName="slide-up"
							transitionAppear={true}
							transitionAppearTimeout={50}
							transitionEnterTimeout={50}
							transitionLeave={false}>
							{(!inst.children.length) ? <div className="col-xs-12">Contains nothing.</div> : 
							inst.children.map( (child,index) => {
								if(typeof child === "string"){
									return (
										<div key={index} className="col-xs-12">
											<div className="description alert alert-default">{child}</div>
										</div>
									)
								}
								var instance = instanceStore.get(child);
								var hasChildren = instance.thing.contains && instance.thing.contains.length !== 0;
								var cssClass = instance.cssClass + (hasChildren ? " link":"");
								var inner = <div className={"child-inner "+cssClass}
									data-thing={instance.thing.name}
									style={{color:instance.textColor}}>
											<i className={instance.icon}></i>
											<h1>{instance.name}</h1>
										</div>;

								if(!hasChildren){
									return (
										<div key={child}
											className="child col-lg-2 col-md-3 col-sm-4 col-xs-6" 
											style={{transitionDelay: 30*index + 'ms'}}>
											{inner}
										</div>)
								}
								
								return (
									<a key={child}
										href={"#"+instance.id}
										className="child col-lg-2 col-md-3 col-sm-4 col-xs-6" 
										style={{transitionDelay: 30*index + 'ms'}}
										onClick={ () => this.setInstance(child) }>
										{inner}
									</a>
								)
							}
						)}
						</CSSTransitionGroup>
			</div>
		);
	}
}

export default Nested;
