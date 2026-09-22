import { ChartWeek, formatWeek } from "@/app/dashboard/helpers";
import styles from "./commit-graph.module.css";

const Bar = ({
  height,
  showDotted = false,
  useNinetyDayColor = false,
  commit,
}: {
  height: number;
  showDotted?: boolean;
  useNinetyDayColor?: boolean;
  commit: ChartWeek;
}) => {
  const heightPercentage = `${height * 100}%`;
  const label = formatWeek(commit.week);
  const commits = `${commit.total} ${commit.total === 1 ? "commit" : "commits"}`;

  return (
    <div
      className={[
        styles.bar,
        showDotted && styles.dotted,
        useNinetyDayColor && styles.coral,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ height: heightPercentage }}
      role="img"
      aria-label={`Week of ${label}: ${commits}${
        showDotted ? ", week in progress" : ""
      }`}>
      {/* The bar carries its own accessible name above, so this is decoration:
          aria-hidden keeps screen readers from announcing the same figures a
          second time. */}
      <span className={styles.tip} aria-hidden="true">
        <span className={styles.tipValue}>{commits}</span>
        <span>Week of {label}</span>
      </span>
    </div>
  );
};

export default Bar;
