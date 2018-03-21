import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import sinon, { spy } from 'sinon';

import ThingView from './ThingView';
import CategoryTabs from './CategoryTabs';
import NameInput from './NameInput';
import IsASelect from './IsASelect';

describe('<ThingView />',()=>{

	it('should mount', ()=>{
		var wrap = mount(<ThingView />);
		wrap.update();
		console.log(wrap);
		wrap.unmount();
	})

	it('<CategoryTabs />', ()=>{
		var wrap = mount(<CategoryTabs getStatus={()=>{ return {} }} status={{isEnabled: true}} thing={{}} />)
		wrap.update();
	})
	it('<NameInput />', ()=>{
		var wrap = mount(<NameInput value="test" thing={{}} status={{}}  />);
		wrap.update();
	})
	it('<IsASelect />', ()=>{
		var wrap = mount(<IsASelect status={{}} thing={{}} />);
		wrap.update();
	})

})
