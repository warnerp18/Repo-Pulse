/**
 * Dependency lockfiles are machine-written: a single `npm install` can
 * rewrite thousands of lines without anyone touching the project's own
 * code. Left in, they take the top of the churn ranking on almost every
 * repo and push out the files a reader is actually looking for — on
 * facebook/react, yarn.lock alone lands +3,258 lines.
 *
 * Matched on the basename, because lockfiles live wherever their manifest
 * does: a monorepo has one per workspace, and fixture directories have
 * their own again.
 *
 * An explicit list, not a `*.lock` pattern. ".lock" is also the extension
 * for editor and process locks that are not dependency files at all, and a
 * pattern would quietly swallow those too. An ecosystem we have not listed
 * simply ranks as normal — the failure mode is a noisy row, not a missing
 * one.
 */
const LOCKFILES = new Set([
  // JavaScript
  "package-lock.json",
  "npm-shrinkwrap.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lock",
  "bun.lockb",
  "deno.lock",
  // Rust, Go, Ruby, PHP
  "Cargo.lock",
  "go.sum", // not a lock by name, but the same generated checksum wall
  "Gemfile.lock",
  "composer.lock",
  // Python
  "poetry.lock",
  "Pipfile.lock",
  "uv.lock",
  "pdm.lock",
  // JVM, .NET
  "gradle.lockfile",
  "packages.lock.json",
  "paket.lock",
  // Apple, Dart, Elixir, Nix, C++
  "Podfile.lock",
  "Package.resolved",
  "pubspec.lock",
  "mix.lock",
  "flake.lock",
  "conan.lock",
]);

/** Takes a repo-relative path, e.g. "packages/app/yarn.lock". */
export function isLockfile(path: string): boolean {
  return LOCKFILES.has(path.slice(path.lastIndexOf("/") + 1));
}
