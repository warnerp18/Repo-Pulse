import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { parseLastPage } from "./parseLastPage.ts";

/** A real header from /repos/facebook/react/contributors, wrapped for width. */
const REAL =
  '<https://api.github.com/repositories/10270250/contributors?page=2>; rel="next", ' +
  '<https://api.github.com/repositories/10270250/contributors?page=14>; rel="last"';

describe("parseLastPage", () => {
  test("reads the page number from the rel=last entry", () => {
    assert.equal(parseLastPage(REAL), 14);
  });

  test("a missing header means a single page, not a failure", () => {
    // GitHub omits Link entirely when everything fits on one page.
    assert.equal(parseLastPage(null), null);
    assert.equal(parseLastPage(""), null);
  });

  test("no rel=last means there is no further page", () => {
    // What you get once you are already on the last page.
    const onLastPage =
      '<https://api.github.com/repositories/1/contributors?page=1>; rel="prev", ' +
      '<https://api.github.com/repositories/1/contributors?page=1>; rel="first"';
    assert.equal(parseLastPage(onLastPage), null);
  });

  test("ignores the page number of every other rel", () => {
    // rel=next comes first and carries a different page; taking the first
    // page= in the header would return 2 instead of 14.
    assert.equal(parseLastPage(REAL), 14);

    const lastFirst =
      '<https://x/c?page=9>; rel="last", <https://x/c?page=2>; rel="next"';
    assert.equal(parseLastPage(lastFirst), 9);
  });

  test("handles page= as the only query parameter", () => {
    assert.equal(parseLastPage('<https://x/c?page=3>; rel="last"'), 3);
  });

  test("handles page= after other parameters", () => {
    assert.equal(
      parseLastPage('<https://x/c?per_page=1&page=403>; rel="last"'),
      403,
    );
  });

  test("returns null rather than NaN on a malformed entry", () => {
    assert.equal(parseLastPage('<https://x/c>; rel="last"'), null);
  });
});
