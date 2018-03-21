import React from 'react';
import { Router, Route } from 'react-router-dom';
import { expect } from 'chai';
import { mount } from 'enzyme';
import sinon, { spy } from 'sinon';

import Explore from './Explore';
import ExplorePage from './ExplorePage';
import Splash from './Splash';
import { createMemoryHistory } from 'history';

import DB from "../../actions/CRUDAction";

window.location = "/";

const current = {
	isa: 'test',
	index: 0,
	font: 'Open Sans',
	up: [{index:0, name:'myself'}],
	in: [
		{
			up: [{index:0, name: 'test'}],
			name: 'hi',
			in:[{name:'hey', index: 1}],
			index: 99
		}
	]
};

sinon.stub(DB, "get").callsFake(()=>{
	return Promise.resolve({error: null, data: current})
})

spy(Explore.prototype, 'componentDidMount');

describe('<Explore />', () => {

  it('calls componentDidMount', () => {
  	const history = createMemoryHistory();
  	history.location.state = current;
    var wrap = mount(
    	<Router history={history}>
    		<Route path='/' component={Explore} />
    	</Router>
    );
    wrap.update();
    expect(Explore.prototype.componentDidMount.calledOnce).to.equal(true);
  });

});

describe('<ExplorePage />', () =>{

	it('displays', ()=>{
		var wrapper = mount(<ExplorePage {...current} handleClick={()=>{}} />);
		//wrapper.setState({current:current});
		wrapper.update();
	})

});

describe('<Splash />', () =>{

	it('calls componentDidMount', () => {
  	const history = createMemoryHistory();
  	history.location.state = current;
    mount(
    	<Router history={history}>
    		<Route path='/' component={Splash} />
    	</Router>
    );
    expect(Explore.prototype.componentDidMount.calledOnce).to.equal(true);
  });

});