import Swatch, { LANGUAGE_SWATCHES, LANGUAGE_COLORS } from "@/app/dashboard/_components/swatch/Swatch";
import styles from "./top-five-languages.module.css";

const TopFiveLanguages = ({
  languages,
  totalBytes,
}: {
  languages: { name: string; bytes: number }[];
  totalBytes: number;
}) => {
  // The percentages are of every language in the repo, so the top five never
  // add up to the full bar. The leftover is drawn as one neutral segment
  // rather than left as dead space — and being last, it takes the rounded
  // right edge that would otherwise sit mid-bar.
  const shownBytes = languages.reduce((sum, l) => sum + l.bytes, 0);
  const remainder = ((totalBytes - shownBytes) / totalBytes) * 100;

  return (
    <>
      <div className={styles.languageBar}>
        {languages.map((l, i) => {
          const percentage = `${((l.bytes / totalBytes) * 100).toFixed(1)}%`;
          return (
            <span
              key={l.bytes + l.name}
              style={{
                width: percentage,
                backgroundColor: LANGUAGE_COLORS[i],
              }}
            ></span>
          );
        })}
        {remainder > 0 ? (
          <span
            className={styles.remainder}
            style={{ width: `${remainder}%` }}
          />
        ) : null}
      </div>
      <div className={styles.list}>
        {languages.map((l, i) => {
          const percentage = `${((l.bytes / totalBytes) * 100).toFixed(1)}%`;
          return (
            <p key={l.bytes + l.name} className={`row-between ${styles.row}`}>
              <span className={styles.label}>
                <Swatch color={LANGUAGE_SWATCHES[i]} variant="solid" />
                <span className={styles.name}>{l.name}</span>
              </span>
              <span className={styles.percent}>{percentage}</span>
            </p>
          );
        })}
      </div>
    </>
  );
};

export default TopFiveLanguages;
