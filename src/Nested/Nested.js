import React, { Component } from 'react';
import Thing from './Thing.js';
import Instance from './Instance.js'
import Pack from './Pack.js';
import Settings from './Settings.js';
import { CSSTransitionGroup } from 'react-transition-group'
import { SplitButton, MenuItem } from 'react-bootstrap'

import './Nested.css';
import 'animate.css';
import 'font-awesome/css/font-awesome.min.css';
import 'game-icons-font/src/gameiconsfont/css/game-icons-font.min.css';
import './icons/font/flaticon.css';

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
		this.seed = null;
		var _this = this;

		window.location.hash = "#0";
		Pack.doImport(function(packs){

	 		//Thing.checkForIcons();
			_this.getSeed(packs);
	 		_this.forceUpdate();

	 		window.onhashchange = function() {       
			  var id = parseInt(window.location.hash.replace('#',''),10);
			  setTimeout(function(){
			  	if(_this.seed.id != id){
				  	_this.setSeed(id);
				  }
			  },10);
			}
		});
	}
	getSeed(packs){
		var seed = localStorage["seed"];

		if(!seed || !Thing.exists(seed)){
			localStorage["seed"] = seed = packs.defaultSeed;
		}

 		this.seed = Thing.get(seed);

 		if(!this.seed)
 			throw new Error(seed+" could not be found -- it is not a valid seed");

 		this.setSeed(new Instance(this.seed).id);
	}
	setSeed(index, zoomOut){
		//toggleAnimation(document.getElementsByClassName("child"));

		/*document.getElementById("contains").className = "row animated "+(zoomOut?"zoomOutRight":"zoomOutLeft");*/
		this.seed = Instance.get(index);
		if(!this.seed.grown){
  		this.seed.grow();
		}
  	this.seed.thing.beforeRender(this.seed);
		
		/*;
		document.getElementById("contains").className = "row animated "+(zoomOut?"slideInLeft":"slideInRight");*/
		this.forceUpdate();
		document.getElementById("title").className="animated fadeIn";
		
	}
  render() {
  	if(!this.seed)
  		return <p>LOADING</p>

  	return (
    		<div id="content"  data-thing={this.seed.thing.name} className={"container-fluid "+this.seed.cssClass} style={{color:this.seed.textColor}}>

    				<div className="pull-right"><Settings /></div>
    				<h1 id="title" key={this.seed.name} >
    					<Ancestors parent={this.seed.parent} page={this} />    <i className={this.seed.icon}></i> {this.seed.name}
    					
    				</h1>
    					<CSSTransitionGroup id="contains" className="row auto-clear"
			          transitionName="slide-up"
			          transitionAppear={true}
			          transitionAppearTimeout={50}
			          transitionEnterTimeout={50}
			          transitionLeave={false}>
	    					{this.seed.children.map( (child,index) => {
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
					          	onClick={ () => this.setSeed(child) }>
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
