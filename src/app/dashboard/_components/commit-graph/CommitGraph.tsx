import { ChartWeek, formatWeek, getMonthLabels } from "../../helpers";
import Bar from "./Bar";
import Swatch from "../Swatch/Swatch";
import styles from "./commitGraph.module.css";

interface CommitGraphProps {
  weeks: ChartWeek[];
  highestCommitAmount: number;
}

const CommitGraph = ({ weeks, highestCommitAmount }: CommitGraphProps) => {
  // A repo with no commits all year would divide by zero and render 52 NaN
  // heights. Helpers return null rather than 0 for "no data", so this is the
  // genuinely-empty case.
  if (!highestCommitAmount) {
    return <p className="meta">No commit activity in the last year.</p>;
  }

  return (
    <>
      <div className={styles.graph}>
        {weeks.map((week) => (
          <Bar
            key={week.week}
            commit={week}
            height={week.total / highestCommitAmount}
            showDotted={week.isPartial}
            useNinetyDayColor={week.inWindow}
          />
        ))}
      </div>

      {/* One grid column per bar, matching .graph's flex columns exactly, so
          each label sits under the week its month starts in. */}
      <div
        className={styles.monthContainer}
        style={{
          gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
        }}>
        {getMonthLabels(weeks).map(({ label, index }) => (
          <p
            key={`${label}-${index}`}
            className="meta-small"
            style={{ gridColumnStart: index + 1 }}>
            {label}
          </p>
        ))}
      </div>

      <div className={styles.legend}>
        <span>
          <Swatch color="chart-in" /> Last 90 days
        </span>
        <span>
          <Swatch color="chart-out" /> Earlier
        </span>
        <span>
          <Swatch color="chart-in" variant="outline" /> Week in progress
        </span>
      </div>

      {/* The bars are hoverable, which leaves out anyone not using a mouse.
          This is the same data in a form that tabs, reads and copies. */}
      <details className={styles.tableToggle}>
        <summary className="meta-small">View as table</summary>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Week of</th>
                <th scope="col">Commits</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((week) => (
                <tr key={week.week}>
                  <td>
                    {formatWeek(week.week)}
                    {week.isPartial ? " (in progress)" : ""}
                  </td>
                  <td>{week.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
};

export default CommitGraph;
