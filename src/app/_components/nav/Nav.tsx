import Link from "next/link";
import styles from "./nav.module.css";

const Nav = () => {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        {/* The brand mark: the Dot bead with its pulse halo. src/app/icon.svg
            is the same two circles, and the two have to be changed together —
            an icon file is its own document, so it cannot reach url(#g) and
            carries its own copy of the stops. */}
        <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
          <circle cx="16" cy="16" r="14" fill="url(#g)" opacity="0.28" />
          <circle cx="16" cy="16" r="7" fill="url(#g)" />
        </svg>
        Repo Pulse
      </Link>

      <nav aria-label="Main">
        <ul className={styles.links}>
          <li>
            <Link href="/how-it-works" className={styles.link}>
              How it works
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Nav;
