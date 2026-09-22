import styles from "@/app/dashboard/dashboard.module.css";

/**
 * Nothing to show, and nothing wrong: a repo younger than the window, a repo
 * with no detectable languages, or one GitHub declines to list contributors
 * for. Quiet on purpose — an empty panel that looks like an error makes a
 * working app feel broken.
 */
const PanelEmpty = ({ title, detail }: { title: string; detail?: string }) => (
  <div className={styles.empty}>
    <p className={styles.emptyTitle}>{title}</p>
    {detail ? <p className={styles.emptyDetail}>{detail}</p> : null}
  </div>
);

export default PanelEmpty;
