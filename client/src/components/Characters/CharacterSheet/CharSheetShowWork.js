import React from "react";

function makeList(map){
	var arr = [];
	for (var name in map) {
		var list = map[name];
		if (list.join) list = list.join(", ");
		arr.push(<ListItem key={name} name={name} list={list} />);
	}
	return arr;
}

const Subclass = ({subclasses}) => (
	<p>{makeList(subclasses)}</p>
)

const ListItem = ({name, list}) =>(
	<span key={name}>
		{name}: {list}
		<br />
	</span>
)

const Item = ({ xs, label, value}) => (
	<div className={"col-"+(xs ? xs : 4)}>
		<p className="title-sm">
			{label}
		</p>
		<div className="item-entry">
			{value}
		</div>
	</div>
);

const ShowWork = ({col, background, classes}) => (
	<div className={`close-col col-${col}`}>
		<p className="title-sm">Personality Trait</p>
		<p>
			{background.personality}
		</p>
		<p className="title-sm">Ideal</p>
		<p>
			{background.ideal}
		</p>
		<p className="title-sm">Bond</p>
		<p>
			{background.bond}
		</p>
		<p className="title-sm">Flaw</p>
		<p>
			{background.flaw}
		</p>
		<Item
			className={classes.map(c => makeList(c.subclasses)).length ? "" : "hidden"}
			label="Subclasses"
			value={classes.map((c,i) =>
				<Subclass subclasses={c.subclasses} key={i} />
			)}
		/>
	</div>
);

export default ShowWork;
export { Item };