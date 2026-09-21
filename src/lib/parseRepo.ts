/**
 * Accepts the forms people actually paste and returns a canonical
 * "owner/name", or null if the input isn't a valid GitHub repo reference.
 *
 *   facebook/react
 *   github.com/facebook/react
 *   https://github.com/facebook/react
 *   https://www.github.com/facebook/react.git
 *
 * The `github.com/` prefix is stripped when present and never required, so
 * there is no list of URL shapes to maintain.
 *
 * Allowlist, not denylist: anything that isn't exactly owner/name is
 * rejected. That rules out "..", "/", "?", "#", whitespace and control
 * characters, all of which can escape or rewrite the GitHub API URLs this
 * value gets interpolated into.
 *
 * Character rules follow GitHub's own:
 *   owner — alphanumeric and hyphens, no leading/trailing hyphen, max 39
 *   name  — alphanumeric, dot, hyphen, underscore, max 100, not "." or ".."
 */
const REPO_PATTERN =
  /^(?:https?:\/\/)?(?:www\.)?(?:github\.com\/)?([A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?)\/((?!\.{1,2}$)[A-Za-z0-9._-]{1,100}?)(?:\.git)?\/?$/;

export function parseRepo(input: string): string | null {
  const match = REPO_PATTERN.exec(input.trim());
  return match ? `${match[1]}/${match[2]}` : null;
}
