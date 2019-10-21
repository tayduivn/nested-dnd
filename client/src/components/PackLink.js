import React from "react";
import Link from "components/Link";
import styles from "./PackUL.module.scss";

const EDIT_BUTTON = (
	<h2>
		<i className="fas fa-pen-square" />
		<small>Edit</small>
	</h2>
);

export default class PackLink extends React.PureComponent {
	render() {
		const { _id, name, url, title, txt, font, description, isUniverse } = this.props;
		const { dependencies, lastSaw, cssClass = "bg-grey-900" } = this.props;
		const URL = isUniverse ? `/universe/${_id}` : `/packs/${url}`;
		const style = { color: txt };
		return (
			<li className={styles.linkGroup}>
				<Link to={`/explore${URL}`} className={`${styles.button} btn-${cssClass}`}>
					<h1 style={{ fontFamily: font ? `'${font}', serif` : "inherit" }}>{title || name}</h1>
					{description && <p>{description}</p>}
					{isUniverse && dependencies && dependencies.length && (
						<p>
							<strong>Packs</strong>: {dependencies.join(", ")}
						</p>
					)}
					{lastSaw && (
						<p>
							<strong>Currently viewing:</strong> {lastSaw}
						</p>
					)}
				</Link>
				<Link to={`${URL}/edit`} className={`${styles.editButton} btn-${cssClass}`} style={style}>
					{EDIT_BUTTON}
				</Link>
			</li>
		);
	}
}
