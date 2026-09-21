import type { ReactNode } from "react";
import styles from "./panel.module.css";

const Panel = ({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) => {
  return (
    <div className="panel">
      <h2 className={styles.h2}>{title}</h2>
      {children}
    </div>
  );
};

export default Panel;
