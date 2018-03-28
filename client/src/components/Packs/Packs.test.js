import React from 'react';
import { Router, Route } from 'react-router-dom';
import chai from 'chai';
import enzyme from 'enzyme';
import { spy } from 'sinon';
import { createMemoryHistory } from 'history';

import Packs from './Packs';
import Pack from './Pack';
import { PropsRoute } from '../Routes'
import EditPack from './EditPack'

const should = chai.should();

describe('<Packs />',()=>{

	var wrap;

	before(()=>{
		spy(console, 'error')
		spy(enzyme, 'mount')

		global.fetchReturn = {
			publicPacks: [{
				_id: 9028398129,
				title: 'test'
			}]
		};
		wrap = enzyme.mount(
			<Router history={createMemoryHistory('/')}>
				<Route path='/' component={Packs} />
			</Router>
		);
	})

	after(()=>{
		global.fetchReturn = {};
		console.error.restore();
		enzyme.mount.restore();
	})

	it('renders', (done) => {
		setImmediate(()=>{
			wrap.find('h1').should.have.lengthOf(1);
			console.error.calledAfter(enzyme.mount).should.equal(false);
			done();
		});
	});

});

describe('<Pack />',()=>{

	before(()=>{
		spy(console, 'error')
		spy(enzyme, 'mount')

		global.fetchReturn = {
			_id: 9028398129,
			title: 'test',
			generators: [],
			_user: {}
		};
	})

	after(()=>{
		global.fetchReturn = {};
		console.error.restore();
		enzyme.mount.restore();
	})

	describe('<ViewPack />',()=>{

		var wrap;

		before(()=>{
			var history = createMemoryHistory('/dnd');
			history.push('/dnd')
			wrap = enzyme.mount(
				<Router history={history}>
					<PropsRoute path='/' component={Pack} match={{
							path: '/dnd',
							url: '/dnd',
							params: { pack: 'dnd' },
							isExact: true
						}} />
				</Router>
			);
		})

		it('renders',(done)=>{

			setImmediate(()=>{
				wrap.update();
				wrap.find(Pack).instance().state.pack.should.not.equal(null);
				console.error.calledAfter(enzyme.mount).should.equal(false);
				done();
			});

		});

	});

	describe('<EditPack />',()=>{

		it('renders',()=>{
			var wrap = enzyme.mount(<EditPack pack={{}} history={createMemoryHistory('/dnd/edit')} />)
			console.error.calledAfter(enzyme.mount).should.equal(false);

		});

	});
})