import type { ChangedFile } from "../../_hooks/useFetchDashboard";
import styles from "./churnHotspots.module.css";

/** `packages/react/src/ReactHooks.js` -> `packages/react/src/` +
 *  `ReactHooks.js`; a root-level file gets an empty directory. The halves
 *  are kept apart because they shrink differently — see the CSS. */
const splitPath = (path: string) => {
  const lastSlash = path.lastIndexOf("/");

  return lastSlash === -1
    ? { directory: "", base: path }
    : {
        directory: path.slice(0, lastSlash + 1),
        base: path.slice(lastSlash + 1),
      };
};

const ChurnHotspots = ({ files }: { files: ChangedFile[] }) => {
  const topFiveFiles = files.slice(0, 5);

  return (
    <table className={styles.churn}>
      {/* The widths live here rather than on the cells so table-layout:
          fixed can read them off the first row it lays out. */}
      <colgroup>
        <col />
        <col className={styles.numberColumn} />
        <col className={styles.numberColumn} />
        <col className={styles.barColumn} />
      </colgroup>
      {/* The +/- signs carry the columns for a sighted reader, but a screen
          reader would otherwise get "842, 317" with nothing to say which is
          which. Hidden with .visually-hidden rather than display: none,
          which would drop the headers out of the accessibility tree too and
          leave us exactly where we started. */}
      <thead className="visually-hidden">
        <tr>
          <th scope="col">File</th>
          <th scope="col">Additions</th>
          <th scope="col">Deletions</th>
          <th scope="col">Share of changes</th>
        </tr>
      </thead>
      <tbody>
        {topFiveFiles.map((file) => {
          const { directory, base } = splitPath(file.fileName);
          // A rename or a mode change reaches us with nothing added and
          // nothing removed. Guarding the divide keeps that row's bar empty
          // instead of NaN% wide, or — worse — 100% deletions.
          const linesChanged = file.additions + file.deletions;
          const addShare = linesChanged
            ? (file.additions / linesChanged) * 100
            : 0;
          const deleteShare = linesChanged ? 100 - addShare : 0;

          return (
            <tr key={file.fileName} className={styles.row}>
              <td className={styles.path}>
                <a
                  href={file.blobUrl}
                  title={file.fileName}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className={styles.directory}>{directory}</span>
                  <span className={styles.base}>{base}</span>
                </a>
              </td>
              <td className={styles.additions}>
                +{file.additions.toLocaleString()}
              </td>
              <td className={styles.deletions}>
                &minus;{file.deletions.toLocaleString()}
              </td>
              <td>
                {/* The bar restates the two figures, so it is hidden from
                    screen readers and the ratio is given as text instead of
                    leaving the column's header pointing at an empty cell. */}
                <span className="visually-hidden">
                  {Math.round(addShare)}% additions
                </span>
                <span className={styles.track} aria-hidden="true">
                  {addShare > 0 ? (
                    <span
                      className={styles.addFill}
                      style={{ width: `${addShare}%` }}
                    />
                  ) : null}
                  {deleteShare > 0 ? (
                    <span
                      className={styles.deleteFill}
                      style={{ width: `${deleteShare}%` }}
                    />
                  ) : null}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default ChurnHotspots;
