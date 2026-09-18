import { useEffect, useState } from "react";

interface Contributor {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  type: string;
  contributions: number;
}

interface CommitActivityWeek {
  total: number;
  week: number;
  days: number[];
}

interface ChangedFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
}

interface RepoInsightsData {
  languages: {
    data: Record<string, number> | null;
    error: number | null;
  };
  contributors: {
    data: Contributor[] | null;
    error: number | null;
  };
  commitActivity: {
    data: CommitActivityWeek[] | null;
    error: number | null;
  };
  churn: {
    data: { total_commits: number; files: ChangedFile[] } | null;
    error: number | null;
  };
}

const useFetchDashboard = () => {
  const [data, setData] = useState<RepoInsightsData | null>(null);
  const [error, setError] = useState<{ message: string } | null>(null);
  const [fetching, setFetching] = useState(false);
  useEffect(() => {
    const getData = async () => {
      setFetching(true);
      try {
        const res = await fetch("api/repo-insights?repo=facebook/react");

        const body = await res.json();
        if (!res.ok) {
          setError({ message: body.error });
        } else {
          console.log(body.data);
          setData(body.data);
        }
      } catch (err) {
        setError({ message: err instanceof Error ? err.message : String(err) });
      } finally {
        setFetching(false);
      }
    };

    getData();
  }, []);

  return {
    data,
    error,
    fetching,
  };
};

export default useFetchDashboard;
