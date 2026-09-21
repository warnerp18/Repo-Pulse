"use client";
import useFetchDashboard from "./_hooks/useFetchDashboard";
import Panel from "./_components/Panel";
import Skeleton from "./_components/Skeleton";
import styles from "./dashboard.module.css";
import { useSearchParams } from "next/navigation";
import { getCommitTotals, getTopLanguage } from "./helpers";
import { useEffect, useState } from "react";

const DashBoard = () => {
  // const [topLanguage, setTopLanguage] = useState("");
  const searchParams = useSearchParams();
  const repo = searchParams.get("repo") ?? "";
  const { data, fetching, error } = useFetchDashboard(repo);

  console.log({ data });
  const commitData = data?.commitActivity.data;
  const contributors = data?.contributors?.data;
  const languages = data?.languages.data;
  const { topBytes, totalBytes, topName } = languages
    ? getTopLanguage(languages)
    : { topBytes: 0, totalBytes: 0, topName: "" };

  // useEffect(() => {
  //   if (languages) {
  //     const { topBytes, totalBytes, topName } = ;
  //     setTopLanguage(topName);
  //   }
  // }, [languages]);

  const commitTotals = commitData ? getCommitTotals(commitData) : null;

  const filesChanged = data?.churn.data?.files.length;
  const displayedAmount =
    data?.churn.data?.files.length === 300 ? "300+" : filesChanged;

  return (
    <div className={styles.wrap}>
      <header>
        <h1>
          <span className={styles.title}>github.com/</span>
          {repo}
        </h1>

        <div className={styles.queryStatus}>
          <span className={styles.loadingDot}></span>
          <span> {fetching ? "Fetching repo insights…" : ""}</span>
        </div>
      </header>
      <section>
        <div className={`${styles.grid} ${styles.evenGrid}`}>
          <Panel title="Commits">
            {data ? (
              <p className={styles.stat}>{commitTotals?.last90}</p>
            ) : (
              <Skeleton type="number" />
            )}
            <p className={styles.sub}>last 90 days</p>
          </Panel>
          <Panel title="Contributors">
            {data ? (
              <p className={styles.stat}>{contributors?.length}</p>
            ) : (
              <Skeleton type="number" />
            )}
            <p className={styles.sub}>all time</p>
          </Panel>
          {/* <Panel title="Primary language">
            <Skeleton type="number" />
          </Panel> */}
          <Panel title="Top Language">
            {data ? (
              <>
                <p className={styles.statText}>{topName}</p>
                <p
                  className={
                    styles.sub
                  }>{`${Math.floor((topBytes / totalBytes) * 100)}% of 5 languages`}</p>
              </>
            ) : (
              <>
                <Skeleton type="statText" />
                <Skeleton type="sub" />
              </>
            )}
          </Panel>
          <Panel title="Files changed">
            {data ? (
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
          <Panel title="Commit activity">
            <div className={styles.skeletonBars}>
              {Array.from({ length: 52 }, (_, i) => (
                <Skeleton key={i} type={"bar"} />
              ))}
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

  // if (error) {
  //   console.log(error);
  //   // do something eventually. NOt sure what just yet. Log to some service to track?
  // }
};

export default DashBoard;
