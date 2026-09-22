import { NextRequest } from "next/server";
import { env } from "process";
import { setTimeout as sleep } from "timers/promises";
import { parseRepo } from "@/lib/parseRepo";
import { isLockfile } from "@/lib/isLockfile";
import { parseLastPage } from "@/lib/parseLastPage";

const TTL = {
  repoMeta: 60,
  languages: 3600,
  contributors: 3600,
  commitActivity: 3600,
  commits: 86400,
  compare: 3600,
} as const;

async function fetchGitHub(url: string, ttl: number) {
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    },
    cache: "force-cache",
    next: { revalidate: ttl },
  });
}

/** Only the fields the dashboard renders; GitHub sends far more. */
interface Contributor {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  type: string;
  contributions: number;
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
    TTL.languages,
  );
  return res.ok
    ? { data: await res.json(), error: null }
    : { data: null, error: res.status };
}

/**
 * Two calls, in parallel. The first is the list the panel renders; the second
 * exists only to count, because GitHub reports no total in the body — the list
 * call returns 30 items whether the repo has 30 or 4,000.
 *
 * With `per_page=1` every page holds exactly one contributor, so the
 * `rel="last"` page number in the Link header *is* the total.
 */
async function getContributors(repo: string) {
  const [listRes, countRes] = await Promise.all([
    fetchGitHub(
      `https://api.github.com/repos/${repo}/contributors`,
      TTL.contributors,
    ),
    fetchGitHub(
      `https://api.github.com/repos/${repo}/contributors?per_page=1`,
      TTL.contributors,
    ),
  ]);

  if (!listRes.ok) {
    return { data: null, error: listRes.status };
  }

  const list: Contributor[] = await listRes.json();

  // A failed or single-page count is not worth failing the section over:
  // fall back to the length of what we actually received.
  const total =
    (countRes.ok ? parseLastPage(countRes.headers.get("link")) : null) ??
    list.length;

  return { data: { list, total }, error: null };
}

async function getCommitActivity(repo: string) {
  const url = `https://api.github.com/repos/${repo}/stats/commit_activity`;
  let res = await fetchGitHub(url, TTL.commitActivity);

  for (const delay of [1000, 2000]) {
    if (res.status !== 202) break;
    await sleep(delay);
    res = await fetchGitHub(url, TTL.commitActivity);
  }

  return res.ok
    ? { data: await res.json(), error: null }
    : { data: null, error: res.status };
}

async function getChurn(repo: string, since: string) {
  const commitsRes = await fetchGitHub(
    `https://api.github.com/repos/${repo}/commits?until=${encodeURIComponent(since)}&per_page=1`,
    TTL.commits,
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
    TTL.compare,
  );
  // TODO: this `as` cast trusts GitHub's response shape with no runtime
  // check. Replace with a Zod schema (here and at the other .json() calls
  // in this file) to actually validate external API responses at the boundary.
  const compare = (await compareRes.json()) as {
    total_commits: number;
    files: GitHubComparisonFile[];
  };

  // Lockfiles are dropped before the sort, not after, so they cannot take
  // slots in the twenty we keep. totalFiles still counts them: the tile
  // above the panel reports how many files changed, which they did — it is
  // only the "where is the work happening" ranking they distort.
  const twentyFiles = compare.files
    .filter((file) => !isLockfile(file.filename))
    .toSorted((a, b) => b.changes - a.changes)
    .slice(0, 20);

  const filteredCompare = {
    totalFiles: compare.files.length,
    totalCommits: compare.total_commits,
    files: twentyFiles.map((file) => {
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
  const res = await fetchGitHub(
    `https://api.github.com/repos/${repo}`,
    TTL.repoMeta,
  );

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

  /* Truncated to UTC midnight, not Date.now() minus 90 days. This value goes
     into the /commits?until= URL, and the fetch cache keys on the URL — a
     millisecond-precision timestamp would make every request a unique key and
     the churn path would never cache. Whole UTC days also match the window
     convention the rest of the project uses. */
  const t = new Date();
  const ninetyDaysAgo = new Date(
    Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate() - 90),
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
