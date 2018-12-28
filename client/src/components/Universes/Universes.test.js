import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import chai from "chai";
import enzyme from "enzyme";
import { spy } from "sinon";

import Universes from "./Universes";

describe("<Universes />", () => {
	before(() => {
		spy(console, "error");
		spy(enzyme, "mount");

		global.fetchReturn = [
			{
				_id: 20980223894,
				title: "Test Universe"
			}
		];
	});

	after(() => {
		global.fetchReturn = {};
		console.error.restore();
		enzyme.mount.restore();
	});

	it("should mount", done => {
		var wrap = enzyme.mount(
			<Router>
				<Universes match={{ url: "universes", params: {} }} />
			</Router>
		);
		setImmediate(() => {
			wrap.update();
			console.error.calledAfter(enzyme.mount).should.equal(false);
			// wrap.find('#Universes').should.have.lengthOf(1);
			done();
		});
	});
});
