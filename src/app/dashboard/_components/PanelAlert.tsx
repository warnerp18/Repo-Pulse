import type { ReactNode } from "react";
import styles from "@/app/dashboard/dashboard.module.css";

/**
 * A section that genuinely failed. Deliberately louder than an empty state:
 * the two used to render as the same muted line, so only the wording told a
 * reader that something was broken rather than simply absent.
 *
 * Reserved for real failures. "Unavailable" — GitHub declining to serve a
 * contributor list for a huge repo — is a fact about the repo, not a fault,
 * and uses PanelEmpty instead.
 */
const PanelAlert = ({ children }: { children: ReactNode }) => (
  <p className={styles.alert}>
    <svg
      className={styles.alertIcon}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true">
      <path
        d="M12 3 L22 20 H2 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="1.2" fill="currentColor" />
    </svg>
    <span>{children}</span>
  </p>
);

export default PanelAlert;
