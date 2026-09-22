import { NextRequest } from "next/server";
import { env } from "process";
import { setTimeout as sleep } from "timers/promises";
import { parseRepo } from "@/lib/parseRepo";

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
    `https://api.github.com/repos/${repo}/commits?until=${encodeURIComponent(since)}&per_page=1`,
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

async function getRepoMeta(repo: string) {
  const res = await fetchGitHub(`https://api.github.com/repos/${repo}`);

  if (!res.ok) {
    return { data: null, error: res.status };
  }
  const data = await res.json();

  return {
    data: {
      pushedAt: data.pushed_at,
      description: data.description,
      defaultBranch: data.default_branch,
      stargazersCount: data.stargazers_count,
      forksCount: data.forks_count,
      openIssuesCount: data.open_issues_count,
    },
    error: null,
  };
}

export async function GET(request: NextRequest) {
  const rawRepo = request.nextUrl.searchParams.get("repo");

  if (!rawRepo) {
    return Response.json(
      {
        error: "Missing required query param: repo (e.g. ?repo=facebook/react)",
      },
      { status: 400 },
    );
  }

  // This value is interpolated into api.github.com URLs below, and every
  // request carries GITHUB_TOKEN. Unvalidated, "../user" would resolve to
  // https://api.github.com/user/... — outside /repos/ and authenticated as
  // the token owner. Reject anything that isn't exactly owner/name.
  const repo = parseRepo(rawRepo);

  if (!repo) {
    return Response.json(
      {
        error: `Invalid repo: "${rawRepo}". Expected owner/name (e.g. facebook/react) or a GitHub URL.`,
      },
      { status: 400 },
    );
  }

  const ninetyDaysAgo = new Date(
    Date.now() - 90 * 24 * 60 * 60 * 1000,
  ).toISOString();

  let data;
  try {
    const [metaData, languages, contributors, commitActivity, churn] =
      await Promise.all([
        getRepoMeta(repo),
        getLanguages(repo),
        getContributors(repo),
        getCommitActivity(repo),
        getChurn(repo, ninetyDaysAgo),
      ]);

    if (metaData.error === 404) {
      return Response.json(
        {
          error: `Couldn't find "${repo}" on GitHub. Check the spelling — private repos aren't available.`,
        },
        {
          status: 404,
        },
      );
    }

    data = { languages, contributors, commitActivity, churn, metaData };
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
