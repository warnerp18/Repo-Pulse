"use client";
import useFetchDashboard from "./_hooks/useFetchDashboard";
import Panel from "./_components/Panel";
import Skeleton from "./_components/Skeleton";
import Dot from "../_components/Dot/Dot";
import styles from "./dashboard.module.css";
import { useSearchParams } from "next/navigation";
import { formatTimeAgo, getCommitTotals, getTopLanguage } from "./helpers";
import CommitGraph from "./_components/commitGraph/CommitGraph";
import TopContributors from "./_components/topContributors/TopContributors";
import TopFiveLanguages from "./_components/topFiveLanguages/TopFiveLanguage";
import ChurnHotspots from "./_components/churnHotspots/ChurnHotspots";
import Link from "next/link";
import Sky from "../_components/Sky/Sky";

const DashBoard = () => {
  const searchParams = useSearchParams();
  const repo = searchParams.get("repo") ?? "";
  const { data, fetching, error } = useFetchDashboard(repo);

  const commitData = data?.commitActivity.data;
  const contributors = data?.contributors?.data;
  const languages = data?.languages.data;
  const { topBytes, totalBytes, topName, topFive } = languages
    ? getTopLanguage(languages)
    : { topBytes: 0, totalBytes: 0, topName: "", topFive: [] };

  const commitTotals = commitData ? getCommitTotals(commitData) : null;

  // The compare endpoint stops listing files at 300, so a repo that hits
  // the cap has changed at least that many and we cannot say how many more.
  const filesChanged = data?.churn.data?.totalFiles;
  const displayedAmount = filesChanged === 300 ? "300+" : filesChanged;
  const churnedFiles = data?.churn.data?.files;

  const timeAgo = formatTimeAgo(data?.metaData.data?.pushedAt ?? "");

  return (
    <div className={styles.wrap}>
      <Sky />
      <header>
        <div>
          <h1>
            <span className={styles.title}>github.com/</span>
            {repo}
          </h1>
          {/* The placeholder is the same 18px line box the status occupies, so
              the header does not grow when the data lands and push the whole
              page down. */}
          {data ? (
            <p className={styles.queryStatus}>
              <Dot /> Updated {timeAgo} · 90-day window
            </p>
          ) : (
            <Skeleton type="sub" />
          )}
        </div>

        <div className={styles.queryStatus}>
          {data ? (
            <Link href="/" className={styles.back}>
              <svg
                viewBox="0 0 20 12"
                width="20"
                height="12"
                fill="none"
                aria-hidden="true">
                <path
                  d="M18 6 H6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M9 2 L5 6 L9 10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Analyze another repo
            </Link>
          ) : (
            <>
              <Dot pulse />
              <span>Fetching repo insights…</span>
            </>
          )}
        </div>
      </header>
      <section className={styles.panels}>
        <div className={`${styles.grid} ${styles.evenGrid}`}>
          <Panel title="Commits">
            {commitTotals ? (
              <p className={styles.stat}>{commitTotals?.last90}</p>
            ) : (
              <Skeleton type="number" />
            )}
            <p className={styles.sub}>last 90 days</p>
          </Panel>
          <Panel title="Contributors">
            {contributors ? (
              <p className={styles.stat}>{contributors?.length}</p>
            ) : (
              <Skeleton type="number" />
            )}
            <p className={styles.sub}>all time</p>
          </Panel>

          <Panel title="Top Language">
            {topName && topBytes && totalBytes ? (
              <>
                <p className={styles.statText}>{topName}</p>
                <p className={styles.sub}>
                  {totalBytes
                    ? `${Math.floor((topBytes / totalBytes) * 100)}% of ${topFive.length} languages`
                    : ""}
                </p>
              </>
            ) : (
              <>
                <Skeleton type="statText" />
                <Skeleton type="sub" />
              </>
            )}
          </Panel>

          <Panel title="Files changed">
            {displayedAmount ? (
              <p className={styles.stat}>{displayedAmount}</p>
            ) : (
              <>
                <Skeleton type="number" />
              </>
            )}
            <p className={styles.sub}>last 90 days</p>
          </Panel>
        </div>

        <div className={`${styles.grid} ${styles.grid2} ${styles.wideLeft}`}>
          <Panel
            title="Commit activity"
            rightSideText={
              commitTotals
                ? `${commitTotals.lastYear} commits • 52 weeks`
                : undefined
            }>
            {commitTotals ? (
              <>
                <CommitGraph
                  weeks={commitTotals?.weeks ?? []}
                  highestCommitAmount={
                    commitTotals?.mostCommitsInSingleWeek ?? 0
                  }
                />
              </>
            ) : (
              <div className={styles.chartSkeleton}>
                <div className={styles.skeletonBars}>
                  {Array.from({ length: 52 }, (_, i) => (
                    <Skeleton key={i} type={"bar"} />
                  ))}
                </div>
              </div>
            )}
          </Panel>

          <Panel title="Top contributors">
            {contributors?.length ? (
              <TopContributors contributors={contributors} />
            ) : (
              <div className={styles.skeletonStack}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} type="user" />
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className={`${styles.grid} ${styles.grid2} ${styles.wideRight}`}>
          <Panel title="Languages">
            {topFive.length && totalBytes ? (
              <TopFiveLanguages languages={topFive} totalBytes={totalBytes} />
            ) : (
              <div className={styles.skeletonStack}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} type="fullLength" />
                ))}
              </div>
            )}
          </Panel>
          <Panel title="Churn hotspots">
            {churnedFiles?.length ? (
              <ChurnHotspots files={churnedFiles} />
            ) : (
              <div className={styles.skeletonStack}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} type="tableRow" />
                ))}
              </div>
            )}
          </Panel>
        </div>
      </section>
    </div>
  );

  // if (error) {
  //   console.log(error);
  //   // do something eventually. NOt sure what just yet. Log to some service to track?
  // }
};

export default DashBoard;
