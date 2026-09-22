import Link from "next/link";
import styles from "./nav.module.css";

const Nav = () => {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true">
          <path
            d="M12 2 3 7v10l9 5 9-5V7l-9-5Z"
            stroke="url(#g)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
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
