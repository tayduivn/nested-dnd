import React from 'react';
import { Router, Route } from 'react-router-dom';

import { expect } from 'chai';
import { mount } from 'enzyme';
import { spy } from 'sinon';
import Explore from './Explore';
import { createMemoryHistory } from 'history';

window.location = "/";

spy(Explore.prototype, 'componentDidMount');

describe('<Explore />', () => {
  it('calls componentDidMount', () => {
  	const history = createMemoryHistory()
    const wrapper = mount(
    	<Router history={history}>
    		<Route path='/' component={Explore} />
    	</Router>
    );
    expect(Explore.prototype.componentDidMount.calledOnce).to.equal(true);
  });
});