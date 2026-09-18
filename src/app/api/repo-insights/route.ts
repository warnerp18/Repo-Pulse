import { NextRequest } from "next/server";
import { env } from "process";
import { setTimeout as sleep } from "timers/promises";

async function fetchGitHub(url: string) {
  return fetch(url, {
    headers: { Authorization: `Bearer ${env.GITHUB_TOKEN}` },
  });
}

interface GitHubComparisonFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
}

async function getLanguages(repo: string) {
  const res = await fetchGitHub(
    `https://api.github.com/repos/${repo}/languages`,
  );
  return res.ok
    ? { data: await res.json(), error: null }
    : { data: null, error: res.status };
}

async function getContributors(repo: string) {
  const res = await fetchGitHub(
    `https://api.github.com/repos/${repo}/contributors`,
  );
  return res.ok
    ? { data: await res.json(), error: null }
    : { data: null, error: res.status };
}

async function getCommitActivity(repo: string) {
  let res = await fetchGitHub(
    `https://api.github.com/repos/${repo}/stats/commit_activity`,
  );

  if (res.status === 202) {
    await sleep(1000);
    res = await fetchGitHub(
      `https://api.github.com/repos/${repo}/stats/commit_activity`,
    );
  }

  return res.ok
    ? { data: await res.json(), error: null }
    : { data: null, error: res.status };
}

async function getChurn(repo: string, since: string) {
  const commitsRes = await fetchGitHub(
    `https://api.github.com/repos/${repo}/commits?until=${since}&per_page=1`,
  );

  if (!commitsRes.ok) {
    return { data: null, error: commitsRes.status };
  }

  const commits = await commitsRes.json();
  const sha = commits[0]?.sha;

  if (!sha) {
    // No commit found before `since` - nothing to compare against.
    return { data: null, error: 404 };
  }

  const compareRes = await fetchGitHub(
    `https://api.github.com/repos/${repo}/compare/${sha}...HEAD`,
  );
  // TODO: this `as` cast trusts GitHub's response shape with no runtime
  // check. Replace with a Zod schema (here and at the other .json() calls
  // in this file) to actually validate external API responses at the boundary.
  const compare = (await compareRes.json()) as {
    total_commits: number;
    files: GitHubComparisonFile[];
  };

  const filteredCompare = {
    totalCommits: compare.total_commits,
    files: compare.files.map((file) => {
      return {
        fileName: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
        blobUrl: file.blob_url,
      };
    }),
  };
  return compareRes.ok
    ? { data: filteredCompare, error: null }
    : { data: null, error: compareRes.status };
}

export async function GET(request: NextRequest) {
  const repo = request.nextUrl.searchParams.get("repo");

  if (!repo) {
    return Response.json(
      {
        error: "Missing required query param: repo (e.g. ?repo=facebook/react)",
      },
      { status: 400 },
    );
  }

  const ninetyDaysAgo = new Date(
    Date.now() - 90 * 24 * 60 * 60 * 1000,
  ).toISOString();

  let data;
  try {
    const [languages, contributors, commitActivity, churn] = await Promise.all([
      getLanguages(repo),
      getContributors(repo),
      getCommitActivity(repo),
      getChurn(repo, ninetyDaysAgo),
    ]);

    data = { languages, contributors, commitActivity, churn };
  } catch (err) {
    return Response.json(
      {
        error: `Network Error: ${err}`,
      },
      {
        status: 502,
      },
    );
  }

  return Response.json({ data });
}
