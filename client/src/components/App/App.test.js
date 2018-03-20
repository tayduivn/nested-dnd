import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { spy } from 'sinon';
import App from './App';



spy(App.prototype, 'componentDidMount');

describe('<App />', () => {
  it('calls componentDidMount', () => {
    const wrapper = mount(<App />);
    // expect(App.prototype.componentDidMount.calledOnce).to.equal(true);
  });
});