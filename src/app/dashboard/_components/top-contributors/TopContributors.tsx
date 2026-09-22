import { Contributor } from "../../_hooks/useFetchDashboard";
import styles from "./topContributors.module.css";
import Image from "next/image";

const TopContributors = ({ contributors }: { contributors: Contributor[] }) => {
  const topFiveContributors = contributors.slice(0, 5);
  // The bars are relative to the busiest contributor. Math.max keeps a zero
  // top count from turning every width into NaN%; the endpoint sorts
  // descending so it should never be zero, but the bar is not worth a crash.
  const topContributionAmount = Math.max(contributors[0].contributions, 1);

  return (
    <ul className={styles.contributorUserRow}>
      {topFiveContributors?.map((c, i) => {
        return (
          <li key={c.id} className={styles.contributor}>
            <Image
              className={styles.avatar}
              src={c.avatar_url}
              alt=""
              width={28}
              height={28}
            />
            <div className={styles.contributorBody}>
              <div className={styles.contributorInfo}>
                <p className={styles.login}>{`@${c.login}`}</p>
                <p className={styles.count}>
                  {c.contributions.toLocaleString()}
                </p>
              </div>
              <div className={styles.track}>
                <span
                  className={styles.fill}
                  style={{
                    width: `${(c.contributions / topContributionAmount) * 100}%`,
                  }}></span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default TopContributors;
