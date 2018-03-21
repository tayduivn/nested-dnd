import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import sinon, { spy } from 'sinon';

import ThingExplorer from './ThingExplorer';
import NewPackInfo from './NewPackInfo';
import ThingChoice from './ThingChoice';

sinon.stub(window,"localStorage").callsFake(storageMock);

describe('<ThingExplorer />',()=>{

	it('should mount', ()=>{
		var wrap = mount(<ThingExplorer />);
	})


	describe('<NewPackInfo />',()=>{

		it('should mount', ()=>{
			var wrap = mount(<NewPackInfo newPack={{things:{}, tables:{}}} />);
			//console.log(wrap.props());
			//wrap.setProps({newPack: {things:{'hi':{}}, tables:{}}});
		})
	})


	describe('<ThingChoice />',()=>{

		it('should mount', ()=>{
			var wrap = mount(<ThingChoice things={['test','2']} currentThingName="" />);
		})
		
	})
})





function storageMock() {
  var storage = {};

  return {
    setItem: function(key, value) {
      storage[key] = value || '';
    },
    getItem: function(key) {
      return key in storage ? storage[key] : null;
    },
    removeItem: function(key) {
      delete storage[key];
    },
    get length() {
      return Object.keys(storage).length;
    },
    key: function(i) {
      var keys = Object.keys(storage);
      return keys[i] || null;
    }
  };
}