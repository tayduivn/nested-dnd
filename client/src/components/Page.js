import React from "react";

import styles from "./Page.module.scss";

const Page = ({ children, id }) => <article className={styles.root}>{children}</article>;
export default Page;
