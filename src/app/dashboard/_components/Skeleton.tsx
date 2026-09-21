import styles from "../dashboard.module.css";

const classNames = {
  bar: styles.skeletonBar,
  number: styles.skeletonNum,
  user: styles.skeletonUser,
  fullLength: styles.skeletonFullLength,
  tableRow: styles.skeletonTableRow,
  statText: styles.skeletonStatText,
  sub: styles.skeletonSub,
} as const;

type SkeletonType = keyof typeof classNames;

const Skeleton = ({ type }: { type: SkeletonType }) => {
  if (type === "user") {
    return (
      <div className={styles.skeletonUserRow}>
        <div className={`${styles.skeleton} ${classNames.user}`}></div>
        <div className={`${styles.skeleton} ${styles.skeletonUsername}`}></div>
      </div>
    );
  }

  if (type === "tableRow") {
    return (
      <div className={classNames.tableRow}>
        <div className={`${styles.skeleton} ${styles.skeletonFilename}`}></div>
        <div className={`${styles.skeleton} ${styles.skeletonStat}`}></div>
        <div className={`${styles.skeleton} ${styles.skeletonStat}`}></div>
      </div>
    );
  }

  return <div className={`${styles.skeleton} ${classNames[type]}`}></div>;
};

export default Skeleton;
