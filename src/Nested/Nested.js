import React, { Component } from 'react';
import Thing from './Thing.js';
import Instance, {instances}  from './Instance.js'
import Pack from './Pack.js';
import { CSSTransitionGroup } from 'react-transition-group'
import { SplitButton, MenuItem } from 'react-bootstrap'

import './Nested.css';
import 'animate.css';
import 'font-awesome/css/font-awesome.min.css';
import 'game-icons-font/src/gameiconsfont/css/game-icons-font.min.css';
import './icons/font/flaticon.css';

class Nested extends Component {
	constructor(){
		super();
		this.seed = null;
		var _this = this;

		Pack.doImport(function(packs){

	 		//Thing.checkForIcons();
			_this.getSeed(packs);
	 		_this.forceUpdate();
		});
	}
	getSeed(packs){
		var seed = localStorage["seed"];

		if(!seed)
			localStorage["seed"] = seed = packs.defaultSeed;

 		this.seed = Thing.get(seed);

 		if(!this.seed)
 			throw new Error(seed+" could not be found -- it is not a valid seed");

 		this.seed = new Instance(this.seed);
	}
	setSeed(index, zoomOut){
		/*document.getElementById("contains").className = "row animated "+(zoomOut?"zoomOutRight":"zoomOutLeft");*/
		this.seed = instances[index];
		var _t = this;
		
		/*;
		document.getElementById("contains").className = "row animated "+(zoomOut?"slideInLeft":"slideInRight");*/
		_t.forceUpdate();
		document.getElementById("title").className="animated fadeIn";
		
	}
  render() {
  	if(!this.seed)
  		return <p>LOADING</p>

  	if(!this.seed.grown)
  		this.seed.grow();

  	// parent
  	var parent = <p></p>;

  	if(this.seed.parent !== null){
  		var parentInst = instances[this.seed.parent];
  		var title = <span><i className="fa fa-angle-left"></i> {parentInst.name}</span>;
  		var ancestors = [];


  		if(parentInst.parent !== null){
  			var current = parentInst.parent;
  			var _t = this;
	  		while(current !== null){
	  			var ancestor = instances[current];
	  			ancestors.push(
	  				<MenuItem key={ancestors.length+1} eventKey={current}
	  					onSelect={(key) => this.setSeed(key,true) }> 
	  					{ancestor.name}
	  				</MenuItem>)
	  			current = ancestor.parent;
	  		}
	  		parent = <SplitButton 
			  	title={title}
			  	onClick={() => this.setSeed(this.seed.parent,true)}
			  	id="ancestorDropdown">
			      {ancestors}
			    </SplitButton>;
  		}else{
  			parent = (<button className="btn btn-default"
  				onClick={() => this.setSeed(this.seed.parent,true)}>
  				{title}
  			</button>)
  		}
  		parent = (<span className={"parent "+parentInst.cssClass}
  				style={{color:parentInst.thing.textColor}}>
  				{parent}
  				</span>)
  		
		  
  	}

  	return (
    		<div id="content" className={"container-fluid "+this.seed.cssClass} style={{color:this.seed.thing.textColor}}>
    				
    				<h1 id="title" key={this.seed.name} >
    					{parent} <i className={this.seed.icon}></i> {this.seed.name}
    				</h1>
    				
    				<div id="contains" className="row auto-clear">
    					<CSSTransitionGroup
			          transitionName="slide-up"
			          transitionAppear={true}
			          transitionAppearTimeout={0}
			          transitionEnterTimeout={0}
			          transitionLeave={false}>
	    					{this.seed.children.map( (child,index) => {
	    						if(typeof child === "string"){
	    							return (
											<div className="col-xs-12">
												<div className="alert alert-warning">{child}</div>
											</div>
										)
	    						}
	    						var instance = instances[child];
	    						var inner = <div className={"child-inner "+instance.cssClass}
	    							style={{color:instance.thing.textColor}}>
								      	<i className={instance.icon}></i>
								      	<h1>{instance.name}</h1>
								      </div>;

	    						if(instance.getBlueprint().length ==0){
	    							return (
	    								<div key={child}
						          	className="child col-lg-2 col-md-3 col-sm-4 col-xs-6" 
						          	style={{transitionDelay: 30*index + 'ms'}}>
									      {inner}
								      </div>)
	    						}
	    						
	    						return (
					          <a key={child}
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
    		</div>
    );
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
