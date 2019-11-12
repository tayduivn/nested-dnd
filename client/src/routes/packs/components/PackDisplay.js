import React, { Component } from "react";
import Tabs from "components/Tabs";
import Link from "components/Link";
import GeneratorsList from "containers/GeneratorsList";
import TablesList from "components/TablesList";
import Page from "components/Page";

class PackInfo extends React.PureComponent {
	render() {
		const { isOwner, user, isPublic, url, font, defaultSeed } = this.props;
		return (
			<ul>
				{/* --------- Author ------------ */}
				{isOwner ? null : (
					<li>
						<strong>Author: </strong>
						<Link to={"/user/" + user._id}>{user.name}</Link>
					</li>
				)}

				{/* --------- Public ------------ */}
				<li>{isPublic ? "Public" : "Private"}</li>
				{url ? (
					<li>
						<Link to={"/explore/" + url}>Explore</Link>
					</li>
				) : null}

				{/* --------- Font ------------ */}
				<li>Font: {font}</li>

				{/* --------- Default Seed ------------ */}
				{defaultSeed ? (
					<li>
						<strong>DefaultSeed: </strong> {defaultSeed}
					</li>
				) : null}

				{/* --------- Dependencies: TODO ------------ */}
			</ul>
		);
	}
}

const GENERATORS = "generators";
const TABLES = "tables";
const TAB_LABELS = [GENERATORS, TABLES];

/**
 * View a Pack
 */
export default class PackDisplay extends Component {
	render() {
		const { name, _id, _user: user = {}, url, defaultSeed, isOwner, public: isPublic } = this.props;
		const { generators = {}, tables = [], font, handleRebuild, activeTab } = this.props;
		return (
			<Page>
				<h1>{name}</h1>

				{isOwner && (
					<div>
						<Link to={"/packs/" + _id + "/edit"}>
							<button className="btn btn-outline-dark">
								<i className="fa fa-pencil-alt" /> Edit Pack
							</button>
						</Link>
						&nbsp;
						<button className="btn btn-danger" onClick={handleRebuild}>
							Rebuild
						</button>
					</div>
				)}

				<PackInfo {...{ isOwner, user, isPublic, url, font, defaultSeed }} />

				<Tabs labels={TAB_LABELS} active={activeTab || GENERATORS}>
					<GeneratorsList
						label={GENERATORS}
						generators={generators}
						{...{ isOwner, packUrl: url }}
					/>
					<TablesList label={GENERATORS} {...{ tables, isOwner, packUrl: url }} />
				</Tabs>
			</Page>
		);
	}
}+
