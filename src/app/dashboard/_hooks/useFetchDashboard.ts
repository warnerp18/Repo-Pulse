import { useEffect, useState } from "react";

export interface Contributor {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  type: string;
  contributions: number;
}

export interface CommitActivityWeek {
  total: number;
  week: number;
  days: number[];
}

/** Shaped by getChurn in the route — camelCase, not GitHub's raw keys. */
export interface ChangedFile {
  fileName: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  blobUrl: string;
}

/** Shaped by getRepoMeta in the route — camelCase, not GitHub's raw keys. */
export interface RepoMetaData {
  /** ISO 8601. Last push to any branch, not only the default one. */
  pushedAt: string;
  description: string | null;
  defaultBranch: string;
  stargazersCount: number;
  forksCount: number;
  openIssuesCount: number;
}

export interface RepoInsightsData {
  metaData: {
    data: RepoMetaData | null;
    error: number | null;
  };
  languages: {
    data: Record<string, number> | null;
    error: number | null;
  };
  contributors: {
    /* `list` is one page of contributors (GitHub's default 30); `total` is the
       real count, read from the Link header of a separate per_page=1 request.
       They are deliberately different numbers — the panel shows the first few,
       the tile reports how many there are. */
    data: { list: Contributor[]; total: number } | null;
    error: number | null;
  };
  commitActivity: {
    data: CommitActivityWeek[] | null;
    error: number | null;
  };
  churn: {
    data: {
      totalCommits: number;
      totalFiles: number;
      files: ChangedFile[];
    } | null;
    error: number | null;
  };
}

const useFetchDashboard = (repoParam: string) => {
  const [data, setData] = useState<RepoInsightsData | null>(null);
  /* status is carried alongside the message so the error screen can name
     what went wrong. Its absence is meaningful: it means the fetch itself
     threw, so no response ever came back. */
  const [error, setError] = useState<{
    message: string;
    status?: number;
  } | null>(null);
  useEffect(() => {
    const getData = async (attempt = 0) => {
      try {
        const res = await fetch(`/api/repo-insights?repo=${repoParam}`);

        const body: { data: RepoInsightsData; error?: string } =
          await res.json();

        if (!res.ok && body.error) {
          setError({ message: body.error, status: res.status });
        } else {
          setData(body.data);

          if (body.data.commitActivity.error === 202 && attempt < 3) {
            setTimeout(() => getData(attempt + 1), 3000);
          }
        }
      } catch (err) {
        setError({ message: err instanceof Error ? err.message : String(err) });
      }
    };

    getData();
  }, [repoParam]);

  return {
    data,
    error,
  };
};

export default useFetchDashboard;
