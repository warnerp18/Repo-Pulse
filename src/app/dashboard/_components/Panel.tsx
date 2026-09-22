import type { ReactNode } from "react";
import styles from "./panel.module.css";
// review names and give better suggestions if needed
const Panel = ({
  title,
  rightSideText,
  children,
}: {
  title: string;
  rightSideText?: string;
  children?: ReactNode;
}) => {
  return (
    <div className="panel">
      <div className={styles.textContianer}>
        <h2 className={styles.h2}>{title}</h2>
        {rightSideText ? <span className="meta">{rightSideText}</span> : null}
      </div>
      {children}
    </div>
  );
};

export default Panel;
