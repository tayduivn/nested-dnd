import React, { Component } from 'react';
import Thing from './Thing.js';
import Instance from './Instance.js'
import Pack from './Pack.js';

import { CSSTransitionGroup } from 'react-transition-group'
import { SplitButton, MenuItem } from 'react-bootstrap'


class Ancestors extends Component {
	constructor(props){
		super(props);
		this.parentID = this.props.parent;
		this.page = this.props.page;
	}
	render(){
		if(this.parentID === null) 
			return <span></span>

		var parentInst = Instance.get(this.parentID);
		var title = <span><i className="fa fa-angle-left"></i> {parentInst.name}</span>;
		var ancestors = [];
		var parent;

		if(parentInst.parent !== null){
			var current = parentInst.parent;
			var _t = this;
			while(current !== null){
				var ancestor = Instance.get(current);
				ancestors.push(
					<MenuItem key={ancestors.length+1} eventKey={current}
						onSelect={(key) => this.page.setSeed(key,true) } href={"#"+current}> 
						{ancestor.name}
					</MenuItem>)
				current = ancestor.parent;
			}
			parent = <SplitButton 
				title={title} href={"#"+this.parentID}
				onClick={() => this.page.setSeed(this.parentID,true)}
				id="ancestorDropdown">
					{ancestors}
				</SplitButton>;
		}else{
			parent = (<a className="btn btn-default" href={"#"+this.parentID}
				onClick={() => this.page.setSeed(this.parentID,true)}>
				{title}
			</a>)
		}

		return (<span className={"parent "+parentInst.cssClass}
				style={{color:parentInst.textColor}}>
				{parent}
				</span>)
	}
}

class Nested extends Component {
	constructor(){
		super();
		var _this = this;
		this.state = {
			instance:null
		};
	}
	//if user clicks the nav bar, this will fire. Need to update seed to root.
	componentWillUpdate(){
		var id = parseInt(window.location.hash.replace('#',''),10);
		if(this.state.instance && this.state.instance.id != id){
			this.setInstance(id);
		}
	}
	//set hash to root onload
	componentDidMount(){
		var _this = this;
		window.location.hash = "#0";
		Pack.doImport(function(packs){

			_this.getSeed(packs);

			//handle back button
			window.addEventListener('hashchange',_this.handleUrlChange);
		});
	}
	componentWillUnmount(){
		window.removeEventListener('hashchange',this.handleUrlChange);
	}
	handleUrlChange(){
		var id = parseInt(window.location.hash.replace('#',''),10);

		var _this = this;
		setTimeout(function(){
			if(_this.state && _this.state.instance.id != id){
				_this.setInstance(id);
			}
		},10);
	}
	getSeed(packs){
		var seed = localStorage["seed"];

		if(!seed){
			localStorage["seed"] = seed = packs.defaultSeed;
		}

		seed = seed.split(">");
		if(seed.length === 1){
			if(Instance.get(0))
				return this.setInstance(0);

			seed = seed[0];
			if(!Thing.exists(seed)){
				localStorage["seed"] = seed = packs.defaultSeed;
			}
			return this.setInstance(new Instance(Thing.get(seed)).id);
		}

		var parent,current;
		for(var i = 0, name; name = seed[i]; i++){
			name = name.trim();
			if(!Thing.exists(name)){
				console.error("can't find thing "+name)
				seed = false;
				break;
			}
			if(parent){
				current = parent.findChild(name);
			}
			else if(Instance.get(0))
				return this.setInstance(0);
			else{
				current = new Instance(Thing.get(name));
			}
			console.log("loaded "+current.name);
			parent = current;
			
			return this.setInstance(current.id);
		}
	}
	setInstance(index, zoomOut){
		//toggleAnimation(document.getElementsByClassName("child"));

		/*document.getElementById("contains").className = "row animated "+(zoomOut?"zoomOutRight":"zoomOutLeft");*/
		var instance = Instance.get(index);
		if(!instance.grown){
			instance.grow();
		}
		instance.thing.beforeRender(this.seed);
		
		/*;
		document.getElementById("contains").className = "row animated "+(zoomOut?"slideInLeft":"slideInRight");*/
		if(document.getElementById("title"))
			document.getElementById("title").className="animated fadeIn";

		this.setState({"instance": instance});
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
							{inst.children.map( (child,index) => {
								if(typeof child === "string"){
									return (
										<div className="col-xs-12">
											<div className="alert alert-warning">{child}</div>
										</div>
									)
								}
								var instance = Instance.get(child);
								var inner = <div className={"child-inner "+instance.cssClass}
									style={{color:instance.textColor}}>
											<i className={instance.icon}></i>
											<h1>{instance.name}</h1>
										</div>;

								if(instance.thing.contains.length == 0){
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

function toggleAnimation(arr) {
	var style;
	for (var i = 0; i < arr.length; i++) {
		arr[i].classList.remove("slide-up-appear-active");
		arr[i].classList.remove("slide-up-enter-active");
		arr[i].classList.remove("slide-up-enter");
	}
}






/*transitionName={ {
								enter: 'bounceIn',
								enterActive: 'bounceIn',
								leave: 'fadeOutLeft',
								leaveActive: 'fadeOutLeft'
							} }
							transitionEnterTimeout={400}
							transitionLeaveTimeout={400}*/



export default Nested;
