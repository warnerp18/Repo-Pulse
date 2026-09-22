import styles from "./dot.module.css";

const Dot = ({
  /** Pulses while something is in flight; steady when it is not. */
  pulse = false,
}: {
  pulse?: boolean;
}) => (
  <span
    className={[styles.dot, pulse && styles.pulse].filter(Boolean).join(" ")}
    aria-hidden="true"
  />
);

export default Dot;
