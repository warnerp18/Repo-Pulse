"use client";
import { useState } from "react";
import styles from "./repoForm.module.css";
import { parseRepo } from "@/lib/parseRepo";
import { useRouter } from "next/navigation";

const RepoForm = () => {
  const [formValue, setFormValue] = useState("facebook/react");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setFormValue(e.target.value);
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const repo = parseRepo(formValue);
    if (!repo) {
      setError(
        formValue.trim()
          ? "That doesn't look like a repository. Use owner/name, like facebook/react."
          : "Enter a repository to analyze, like facebook/react.",
      );
      return;
    }
    const params = new URLSearchParams({ repo });

    router.push(`/dashboard?${params}`);
  };

  return (
    <form className={`panel ${styles.form}`} noValidate onSubmit={handleSubmit}>
      <label htmlFor="repo">
        GitHub repository
        <span className={styles.req} aria-hidden="true">
          *
        </span>
      </label>

      <div className={styles.row}>
        <div className={styles.field}>
          <input
            id="repo"
            name="repo"
            type="text"
            placeholder="owner/name"
            autoComplete="off"
            spellCheck={false}
            required
            value={formValue}
            aria-describedby="hint result"
            onChange={handleChange}
          />
        </div>
        <button className={styles.analyze} type="submit">
          Analyze
          <svg
            className={styles.arrow}
            viewBox="0 0 20 12"
            width="20"
            height="12"
            fill="none"
            aria-hidden="true">
            <path
              className={styles.shaft}
              d="M2 6 H14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              className={styles.head}
              d="M11 2 L15 6 L11 10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <p className={styles.hint} id="hint">
        Public repos only. Use owner/name or paste the GitHub URL.
      </p>

      <p
        className={`${styles.result} ${error ? styles.bad : ""}`}
        id="result"
        role="status"
        aria-live="polite">
        {error}
      </p>

      <div className={styles.tries}>
        <span>Try:</span>
        <button
          className={styles.chip}
          type="button"
          onClick={() => setFormValue("facebook/react")}>
          facebook/react
        </button>
        <button
          className={styles.chip}
          type="button"
          onClick={() => setFormValue("vercel/next.js")}>
          vercel/next.js
        </button>
        <button
          className={styles.chip}
          type="button"
          onClick={() => setFormValue("torvalds/linux")}>
          torvalds/linux
        </button>
      </div>
    </form>
  );
};

export default RepoForm;
