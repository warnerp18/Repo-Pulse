"use client";

import Link from "next/link";
import { useEffect } from "react";
import styles from "./dashboard.module.css";

const DashBoardError = ({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) => {
  useEffect(() => {
    // Real production app we would log to a service
    console.error(error);
  }, [error]);

  return (
    <div className={styles.wrap}>
      <div className={"panel"}>
        <h1>Something went wrong</h1>
        <p>
          We couldn&apos;t load this dashboard. The repo data may be unavailable
          right now.
        </p>
        <div className={styles.errorButtonContainer}>
          <button className="button button-primary" onClick={() => retry()}>
            Try again
          </button>

          <Link href="/" className="button">
            Analyze another repo
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && <pre>{error.message}</pre>}
      </div>
    </div>
  );
};

export default DashBoardError;
