/**
 * GitHub paginates list endpoints and does not report a total in the body —
 * `/contributors` returns 30 items whether the repo has 30 or 4,000. The only
 * place the total appears is the `Link` response header:
 *
 *   <https://api.github.com/repositories/10270250/contributors?page=2>; rel="next",
 *   <https://api.github.com/repositories/10270250/contributors?page=14>; rel="last"
 *
 * Request with `per_page=1` and each page holds exactly one item, so the
 * `rel="last"` page number *is* the count — one request instead of walking
 * every page.
 *
 * Returns null when there is no next/last link, which is not a failure: GitHub
 * omits the header entirely for a single-page result, and drops `rel="last"`
 * once you are already on the final page. Either way the caller should fall
 * back to counting what it received.
 *
 * The URL is never validated, only scanned for `page=`. GitHub rewrites these
 * links to the numeric repository id (`/repositories/10270250/`) because named
 * repos 301-redirect, so the host and path will not match what was requested.
 */
export function parseLastPage(linkHeader: string | null): number | null {
  if (!linkHeader) return null;

  for (const entry of linkHeader.split(",")) {
    if (!/;\s*rel="last"/.test(entry)) continue;

    const page = entry.match(/[?&]page=(\d+)/);
    if (!page) return null;

    const n = Number(page[1]);
    return Number.isSafeInteger(n) && n > 0 ? n : null;
  }

  return null;
}
