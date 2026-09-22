import RepoForm from "./_components/repo-form/RepoForm";
import Sky from "./_components/sky/Sky";
import styles from "./home.module.css";

const Home = () => {
  return (
    <>
      <Sky />

      <main>
        <p className={styles.eyebrow}>
          Engineering analytics for any public repo
        </p>
        <h1 className={styles.headline}>See how a codebase really moves</h1>
        <p className={styles.lede}>
          Paste a public GitHub repository and get commit trends, top
          contributors, language mix and churn hotspots in one view.
        </p>

        <RepoForm />

        <section className={styles.features} aria-label="What you get">
          <div className={styles.feature}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true">
              <path
                d="M3 17l5-5 4 4 8-9"
                stroke="url(#g)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <h2>Commit activity</h2>
              <p>Weekly commits across the last year</p>
            </div>
          </div>

          <div className={styles.feature}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true">
              <circle cx="8" cy="8" r="3" stroke="url(#g)" strokeWidth="2" />
              <circle cx="17" cy="8" r="3" stroke="url(#g)" strokeWidth="2" />
              <circle
                cx="12.5"
                cy="18"
                r="3"
                stroke="url(#g)"
                strokeWidth="2"
              />
            </svg>
            <div>
              <h2>Top contributors</h2>
              <p>Who is driving the codebase, and how much</p>
            </div>
          </div>

          <div className={styles.feature}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true">
              <path
                d="M4 20V10M12 20V4M20 20v-7"
                stroke="url(#g)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <div>
              <h2>Churn hotspots</h2>
              <p>The files changing fastest, and riskiest</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;
