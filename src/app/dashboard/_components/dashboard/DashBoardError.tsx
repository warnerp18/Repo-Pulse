import Link from "next/link";
import styles from "@/app/dashboard/dashboard.module.css";

/* The statuses route.ts returns at the top level. Anything unlisted falls back
   to a generic line rather than claiming something specific and wrong. */
const EYEBROWS: Record<number, string> = {
  400: "Unreadable repo name",
  404: "Repo not found",
  502: "GitHub didn't respond",
};

const DashboardError = ({
  message,
  status,
}: {
  message: string;
  status?: number;
}) => {
  /* No status at all means the fetch threw before any response arrived — a
     dropped connection rather than a rejected request. */
  const eyebrow = status
    ? (EYEBROWS[status] ?? "Request failed")
    : "Couldn't reach the server";

  return (
    <div className={styles.errorWrap}>
      <div className="panel">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className={`text-gradient ${styles.errorHeading}`}>
          We couldn&apos;t analyze that repo
        </h1>
        <p className={styles.errorMessage}>{message}</p>
        <div className={styles.errorButtonContainer}>
          <Link href="/" className={`button ${styles.errorBack}`}>
            <svg
              className={styles.arrow}
              viewBox="0 0 20 12"
              width="20"
              height="12"
              fill="none"
              aria-hidden="true">
              <path
                className={styles.shaft}
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
          <p className="hint">Nothing was loaded, so nothing is out of date.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardError;
