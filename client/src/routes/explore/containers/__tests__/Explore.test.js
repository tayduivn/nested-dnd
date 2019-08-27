import React from "react";
import { Router } from "react-router-dom";
import { expect } from "chai";
import { mount } from "enzyme";
import { spy } from "sinon";
import { Provider } from "react-redux";
import { PropsRoute } from "../Routes";

import Explore from "./Explore";
import ExplorePage from "./ExplorePage";
import Ancestors from "./Ancestors";
import Splash from "./Splash";
import { createMemoryHistory } from "history";
import { store } from "../App";

window.location = "/";
const NOOP = () => {};

const current = {
	isa: "test",
	index: 0,
	font: "Open Sans",
	up: [{ index: 0, name: "myself" }],
	in: [
		{
			up: [{ index: 0, name: "test" }],
			name: "hi",
			in: [{ name: "hey", index: 1 }],
			index: 99
		}
	]
};

spy(Explore.prototype, "componentDidMount");

var wrap;

describe("<Explore />", () => {
	beforeAll(() => {
		const history = createMemoryHistory();
		history.location.state = current;
		wrap = mount(
			<Provider store={store}>
				<Router history={history}>
					<PropsRoute path="/" component={Explore} loadCurrent={NOOP} loadFonts={NOOP} />
				</Router>
			</Provider>
		);

		global.fetchReturn = current;
	});

	afterAll(() => {
		global.fetchReturn = {};
	});

	it("calls componentDidMount", () => {
		wrap.update();
		expect(Explore.prototype.componentDidMount.calledOnce).to.equal(true);
	});

	it("sets current", done => {
		var explore = wrap.find(Explore).instance();
		setImmediate(() => {
			var current = explore.state.current;
			explore.state.should.have.property("error", null);
			// current.should.have.property('isa','test'); // TODO
			done();
		});
	});
});

describe("<ExplorePage />", () => {
	it("displays", () => {
		const history = createMemoryHistory();
		history.location.state = current;
		var wrapper = mount(
			<Router history={history}>
				<ExplorePage {...current} handleClick={() => {}} />
			</Router>
		);
		//wrapper.setState({current:current});
		wrapper.update();
	});
});

describe("<Splash />", () => {
	it("calls componentDidMount", () => {
		const history = createMemoryHistory();
		history.location.state = current;
		mount(
			<Router history={history}>
				<PropsRoute path="/" component={Splash} loadFonts={NOOP} />
			</Router>
		);
		expect(Explore.prototype.componentDidMount.calledOnce).to.equal(true);
	});
});

describe("<Ancestors />", () => {
	it("renders single button", done => {
		var wrapper = mount(
			<Ancestors handleClick={() => {}} ancestors={[{ name: "test", index: 0 }]} />
		);
		setImmediate(() => {
			expect(wrapper.getElements("button")).to.have.lengthOf(1);
			done();
		});
	});

	it("renders split button", done => {
		var wrapper = mount(
			<Ancestors
				handleClick={() => {}}
				ancestors={[{ name: "test", index: 0 }, { name: "hello", index: 1 }]}
			/>
		);
		setImmediate(() => {
			expect(wrapper.getElements(".ancestors__dropdown-item")).to.have.lengthOf(1);
			done();
		});
	});
});
