import Panel from "@/app/dashboard/_components/Panel";
import Skeleton from "@/app/dashboard/_components/Skeleton";
import Dot from "@/app/_components/dot/Dot";
import Sky from "@/app/_components/sky/Sky";
import styles from "@/app/dashboard/dashboard.module.css";

/* The dashboard's loading shell, lifted out of DashBoard's own placeholder
   branches so the two cannot drift apart.

   This renders in the prerendered HTML as the Suspense fallback, before
   hydration hands over to DashBoard. It deliberately takes no props: the repo
   name comes from ?repo=, which is exactly the value that is not available
   until the client takes over — so the <h1> shows the "github.com/" prefix
   alone rather than guessing. The prefix keeps the heading's line box filled,
   so the name appearing does not shift the page. */
const DashboardSkeleton = () => {
  return (
    <div className={styles.wrap}>
      <Sky />
      <header>
        <div>
          <h1>
            <span className={styles.title}>github.com/</span>
          </h1>
          {/* same 18px line box the real status line occupies, so the header
              does not grow when the data lands */}
          <Skeleton type="sub" />
        </div>

        <div className={styles.queryStatus}>
          <Dot pulse />
          <span>Fetching repo insights…</span>
        </div>
      </header>

      <section className={styles.panels}>
        <div className={`${styles.grid} ${styles.evenGrid}`}>
          <Panel title="Commits">
            <Skeleton type="number" />
            <p className={styles.sub}>last 90 days</p>
          </Panel>

          <Panel title="Contributors">
            <Skeleton type="number" />
            <p className={styles.sub}>all time</p>
          </Panel>

          <Panel title="Top Language">
            <Skeleton type="statText" />
            <Skeleton type="sub" />
          </Panel>

          <Panel title="Files changed">
            <Skeleton type="number" />
            <p className={styles.sub}>last 90 days</p>
          </Panel>
        </div>

        <div className={`${styles.grid} ${styles.grid2} ${styles.wideLeft}`}>
          <Panel title="Commit activity">
            <div className={styles.chartSkeleton}>
              <div className={styles.skeletonBars}>
                {Array.from({ length: 52 }, (_, i) => (
                  <Skeleton key={i} type="bar" />
                ))}
              </div>
            </div>
          </Panel>

          <Panel title="Top contributors">
            <div className={styles.skeletonStack}>
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} type="user" />
              ))}
            </div>
          </Panel>
        </div>

        <div className={`${styles.grid} ${styles.grid2} ${styles.wideRight}`}>
          <Panel title="Languages">
            <div className={styles.skeletonStack}>
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} type="fullLength" />
              ))}
            </div>
          </Panel>

          <Panel title="Churn hotspots">
            <div className={styles.skeletonStack}>
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} type="tableRow" />
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </div>
  );
};

export default DashboardSkeleton;
