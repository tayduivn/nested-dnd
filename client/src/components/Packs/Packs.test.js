import React from "react";
import { Router } from "react-router-dom";
import enzyme from "enzyme";
import { spy } from "sinon";
import { createMemoryHistory } from "history";
import { Provider } from "react-redux";

import Pack from "./Pack";
import Packs from "./Packs";
import { PropsRoute } from "../Routes";
import EditPack from "./EditPack";

import { store } from "../App";

describe("<PacksList />", () => {
	var wrap;

	before(() => {
		spy(console, "error");
		spy(enzyme, "mount");

		global.fetchReturn = {
			publicPacks: [
				{
					_id: 9028398129,
					title: "test"
				}
			]
		};
		wrap = enzyme.mount(
			<Router history={createMemoryHistory("/")}>
				<PropsRoute
					path="/"
					component={Packs}
					match={{
						path: "/dnd",
						url: "/dnd",
						isExact: true
					}}
				/>
			</Router>
		);
	});

	after(() => {
		global.fetchReturn = {};
		console.error.restore();
		enzyme.mount.restore();
	});

	it("renders", done => {
		setImmediate(() => {
			console.error.calledAfter(enzyme.mount).should.equal(false);
			done();
		});
	});
});

describe("<Pack />", () => {
	before(() => {
		spy(console, "error");
		spy(enzyme, "mount");

		global.fetchReturn = {
			_id: 9028398129,
			title: "test",
			generators: [],
			_user: {}
		};
	});

	after(() => {
		global.fetchReturn = {};
		console.error.restore();
		enzyme.mount.restore();
	});

	describe("<ViewPack />", () => {
		var wrap;

		before(() => {
			var history = createMemoryHistory("/dnd");
			history.push("/dnd");
			wrap = enzyme.mount(
				<Provider store={store}>
					<Router history={history}>
						<PropsRoute
							path="/dnd"
							component={Pack}
							match={{
								path: "/dnd",
								url: "/dnd",
								params: { pack: "dnd" },
								isExact: true
							}}
							fetchPack={() => {}}
						/>
					</Router>
				</Provider>
			);
		});

		it("renders", done => {
			setImmediate(() => {
				wrap.update();

				//wrap.find(Pack).instance().state.pack.should.not.equal(null);
				console.error.calledAfter(enzyme.mount).should.equal(false);
				done();
			});
		});
	});

	describe("<EditPack />", () => {
		it("renders", () => {
			var wrap = enzyme.mount(
				<Provider store={store}>
					<EditPack pack={{}} history={createMemoryHistory("/dnd/edit")} match={{ params: [] }} />
				</Provider>
			);
			console.error.calledAfter(enzyme.mount).should.equal(false);
		});
	});
});
