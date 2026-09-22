import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { isLockfile } from "./isLockfile.ts";

describe("isLockfile", () => {
  test("matches a lockfile at the repo root", () => {
    assert.equal(isLockfile("package-lock.json"), true);
    assert.equal(isLockfile("Cargo.lock"), true);
  });

  test("matches a lockfile nested anywhere", () => {
    // The case that motivated this: a fixture app inside a monorepo package
    assert.equal(
      isLockfile("packages/react-devtools-cdt-mcp/fixtures/app/yarn.lock"),
      true,
    );
  });

  test("leaves hand-written source alone", () => {
    assert.equal(isLockfile("src/app/page.tsx"), false);
    assert.equal(isLockfile("Cargo.toml"), false);
    assert.equal(isLockfile("package.json"), false);
  });

  test("matches on the whole basename, not a suffix", () => {
    // "my-package-lock.json" is somebody's source file, not a lockfile
    assert.equal(isLockfile("my-package-lock.json"), false);
    assert.equal(isLockfile("docs/yarn.lock.md"), false);
  });

  test("does not swallow every .lock file", () => {
    // Editor and process locks share the extension but are not generated
    // dependency manifests — the reason this is a list and not a pattern.
    assert.equal(isLockfile(".terraform.lock"), false);
    assert.equal(isLockfile("db/schema.lock"), false);
  });

  test("is case sensitive, matching the real filenames", () => {
    assert.equal(isLockfile("gemfile.lock"), false);
    assert.equal(isLockfile("Gemfile.lock"), true);
  });
});
