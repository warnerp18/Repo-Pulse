"use client";
import useFetchDashboard from "@/app/dashboard/_hooks/useFetchDashboard";
import Panel from "@/app/dashboard/_components/Panel";
import DashboardSkeleton from "@/app/dashboard/_components/dashboard/DashboardSkeleton";
import Skeleton from "@/app/dashboard/_components/Skeleton";
import PanelAlert from "@/app/dashboard/_components/PanelAlert";
import PanelEmpty from "@/app/dashboard/_components/PanelEmpty";
import Dot from "@/app/_components/dot/Dot";
import styles from "@/app/dashboard/dashboard.module.css";
import { useSearchParams } from "next/navigation";
import {
  formatTimeAgo,
  getCommitTotals,
  getTopLanguage,
  panelState,
} from "@/app/dashboard/helpers";
import CommitGraph from "@/app/dashboard/_components/commit-graph/CommitGraph";
import TopContributors from "@/app/dashboard/_components/top-contributors/TopContributors";
import TopFiveLanguages from "@/app/dashboard/_components/top-five-languages/TopFiveLanguage";
import ChurnHotspots from "@/app/dashboard/_components/churn-hotspots/ChurnHotspots";
import Link from "next/link";
import Sky from "@/app/_components/sky/Sky";
import DashboardError from "./DashBoardError";

const DashBoard = () => {
  const searchParams = useSearchParams();
  const repo = searchParams.get("repo") ?? "";
  const { data, error } = useFetchDashboard(repo);

  /* Only when there is nothing else to show: a background retry that fails
     must not replace a dashboard already on screen. */
  if (error && !data)
    return <DashboardError message={error.message} status={error.status} />;
  /* One fetch fills every section at once, so until it lands there is nothing
     to show anywhere. Bailing out here means the checks below no longer have
     to mean two things at once: past this line a null section is a section
     that *failed*, not one still loading. Rendering those as skeletons is the
     open "Error handling" item in HANDOFF.md. */
  if (!data) return <DashboardSkeleton />;

  const contributorsState = panelState("contributors", data.contributors.error);
  const languagesState = panelState("languages", data.languages.error);
  const churnState = panelState("churn", data.churn.error);
  const commitState = panelState("commitActivity", data.commitActivity.error);
  const commitData = data.commitActivity.data;
  const contributors = data.contributors?.data;
  const languages = data.languages.data;
  const { topBytes, totalBytes, topName, topFive } = languages
    ? getTopLanguage(languages)
    : { topBytes: 0, totalBytes: 0, topName: "", topFive: [] };

  const commitTotals = commitData ? getCommitTotals(commitData) : null;

  // The compare endpoint stops listing files at 300, so a repo that hits
  // the cap has changed at least that many and we cannot say how many more.
  const filesChanged = data.churn.data?.totalFiles;
  const displayedAmount = filesChanged === 300 ? "300+" : filesChanged;
  const churnedFiles = data.churn.data?.files;

  const timeAgo = formatTimeAgo(data.metaData.data?.pushedAt ?? "");

  return (
    <div className={styles.wrap}>
      <Sky />
      <header>
        <div>
          <h1>
            <span className={styles.title}>github.com/</span>
            {repo}
          </h1>
          <p className={styles.queryStatus}>
            <Dot /> Updated {timeAgo} · 90-day window
          </p>
        </div>

        <div className={styles.queryStatus}>
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
        </div>
      </header>
      <section className={styles.panels}>
        <div className={`${styles.grid} ${styles.evenGrid}`}>
          <Panel title="Commits">
            {/* pending is the one state where waiting is the right answer:
                GitHub is still computing, so the skeleton is honest. */}
            {commitState === "pending" ? (
              <Skeleton type="number" />
            ) : commitState === "ok" && commitTotals ? (
              <p className={styles.stat}>{commitTotals.last90}</p>
            ) : (
              <p className={styles.statText}>Unavailable</p>
            )}
            <p className={styles.sub}>last 90 days</p>
          </Panel>

          <Panel title="Contributors">
            {/* The sub-line doubles as the explanation, so "all time" is
                replaced by the reason rather than sitting under an error. */}
            {contributorsState === "ok" ? (
              <>
                <p className={styles.stat}>{contributors?.total ?? 0}</p>
                <p className={styles.sub}>all time</p>
              </>
            ) : (
              <>
                <p className={styles.statText}>Unavailable</p>
                <p className={styles.sub}>
                  {contributorsState === "unavailable"
                    ? "too large for GitHub to count"
                    : "couldn't load contributors"}
                </p>
              </>
            )}
          </Panel>

          <Panel title="Top Language">
            {/* State first, then emptiness: a repo with no detectable
                languages returns 200 with {}, so it is ok-but-empty, not an
                error. */}
            {languagesState !== "ok" ? (
              <p className={styles.sub}>Couldn&apos;t load languages</p>
            ) : !topName || !totalBytes ? (
              <p className={styles.sub}>No languages detected</p>
            ) : (
              <>
                <p className={styles.statText}>{topName}</p>
                <p className={styles.sub}>
                  {`${Math.floor((topBytes / totalBytes) * 100)}% of ${topFive.length} languages`}
                </p>
              </>
            )}
          </Panel>

          <Panel title="Files changed">
            {/* ?? 0 rather than a truthiness check: a genuine zero is a real
                answer, and would otherwise fall through to the error branch. */}
            {churnState === "empty" ? (
              <>
                <p className={styles.statText}>New repo</p>
                <p className={styles.sub}>less than 90 days old</p>
              </>
            ) : churnState !== "ok" ? (
              <>
                <p className={styles.sub}>Couldn&apos;t load</p>
                <p className={styles.sub}>last 90 days</p>
              </>
            ) : (
              <>
                <p className={styles.stat}>{displayedAmount ?? 0}</p>
                <p className={styles.sub}>last 90 days</p>
              </>
            )}
          </Panel>
        </div>

        <div className={`${styles.grid} ${styles.grid2} ${styles.wideLeft}`}>
          <Panel
            title="Commit activity"
            rightSideText={
              commitState === "ok" && commitTotals
                ? `${commitTotals.lastYear} commits • 52 weeks`
                : undefined
            }>
            {commitState === "pending" ? (
              <div className={styles.chartSkeleton}>
                <div className={styles.skeletonBars}>
                  {Array.from({ length: 52 }, (_, i) => (
                    <Skeleton key={i} type={"bar"} />
                  ))}
                </div>
              </div>
            ) : commitState === "ok" && commitTotals ? (
              <CommitGraph
                weeks={commitTotals.weeks ?? []}
                highestCommitAmount={commitTotals.mostCommitsInSingleWeek ?? 0}
              />
            ) : (
              <PanelAlert>Couldn&apos;t load commit activity</PanelAlert>
            )}
          </Panel>

          <Panel title="Top contributors">
            {contributorsState === "unavailable" ? (
              <PanelEmpty
                title="Not available for this repo"
                detail="GitHub doesn't list contributors for repositories with very large histories."
              />
            ) : contributorsState !== "ok" ? (
              <PanelAlert>Couldn&apos;t load contributors</PanelAlert>
            ) : !contributors?.list.length ? (
              <PanelEmpty title="No contributors found" />
            ) : (
              <TopContributors contributors={contributors.list} />
            )}
          </Panel>
        </div>

        <div className={`${styles.grid} ${styles.grid2} ${styles.wideRight}`}>
          <Panel title="Languages">
            {languagesState !== "ok" ? (
              <PanelAlert>Couldn&apos;t load languages</PanelAlert>
            ) : !topFive.length || !totalBytes ? (
              <PanelEmpty
                title="No languages detected"
                detail="GitHub found no recognised source files in this repo."
              />
            ) : (
              <TopFiveLanguages languages={topFive} totalBytes={totalBytes} />
            )}
          </Panel>

          <Panel title="Churn hotspots">
            {/* empty means the repo is younger than the 90-day window, which
                is a fact about the repo rather than a failure. */}
            {churnState === "empty" ? (
              <PanelEmpty
                title="New repo"
                detail="Less than 90 days old, so there is nothing to compare against yet."
              />
            ) : churnState !== "ok" ? (
              <PanelAlert>Couldn&apos;t load file changes</PanelAlert>
            ) : !churnedFiles?.length ? (
              <PanelEmpty title="No files changed in the last 90 days" />
            ) : (
              <ChurnHotspots files={churnedFiles} />
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
