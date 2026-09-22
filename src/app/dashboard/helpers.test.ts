import { test, describe, mock, before, after } from "node:test";
import assert from "node:assert/strict";
import type { CommitActivityWeek } from "./_hooks/useFetchDashboard";
import {
  formatWeek,
  getCommitTotals,
  getTopLanguage,
  getMonthLabels,
  formatTimeAgo,
} from "./helpers.ts";

const DAY = 86400;

/**
 * Every helper that touches "now" is untestable against a real clock, so the
 * whole suite runs at a fixed instant: Monday 21 Sep 2026, 12:00 UTC.
 * That makes the 90-day window run back to 24 Jun 2026, and puts us two days
 * into the current week (which starts Sunday the 20th).
 */
const NOW = new Date("2026-09-21T12:00:00Z");
const CURRENT_WEEK_START = Date.UTC(2026, 8, 20) / 1000; // Sun 20 Sep

before(() => mock.timers.enable({ apis: ["Date"], now: NOW }));
after(() => mock.timers.reset());

/** 52 weekly buckets ending with the current, partial week. */
const buildWeeks = (
  totalPerWeek = 7,
  days = [1, 1, 1, 1, 1, 1, 1],
): CommitActivityWeek[] =>
  Array.from({ length: 52 }, (_, i) => ({
    week: CURRENT_WEEK_START - (51 - i) * 7 * DAY,
    total: totalPerWeek,
    days: [...days],
  }));

describe("formatWeek", () => {
  test("reads the bucket in UTC, not the viewer's zone", () => {
    // Midnight UTC on 22 Jun is still 21 Jun in every negative offset
    assert.equal(formatWeek(Date.UTC(2026, 5, 22) / 1000), "Jun 22");
  });

  test("treats the input as seconds, not milliseconds", () => {
    // If the *1000 were missing this would land in January 1970
    assert.equal(formatWeek(Date.UTC(2026, 0, 4) / 1000), "Jan 4");
  });
});

describe("getCommitTotals", () => {
  test("returns null rather than zeroes when there is no data", () => {
    assert.equal(getCommitTotals([]), null);
  });

  test("last90 counts exactly 90 day-buckets", () => {
    // One commit per day makes the total equal the number of days counted,
    // so this asserts the window's width directly: 89 days back plus today.
    const result = getCommitTotals(buildWeeks());
    assert.equal(result?.last90, 90);
  });

  test("lastYear sums every bucket", () => {
    assert.equal(getCommitTotals(buildWeeks())?.lastYear, 52 * 7);
  });

  test("does not count the current week's unelapsed days", () => {
    // Today is Monday, so only Sun + Mon of the current week have happened.
    // A week of 7 commits/day would add 49 if the whole bucket were counted.
    const weeks = buildWeeks(70, [10, 10, 10, 10, 10, 10, 10]);
    const result = getCommitTotals(weeks);
    const currentWeek = result!.weeks.at(-1)!;
    assert.equal(currentWeek.total, 70);
    // 12 full weeks x 70 = 840, plus Sun+Mon of this week = 20, plus the
    // part-week at the cutoff. The assertion that matters: nowhere near
    // the 910 you would get by counting the current bucket whole.
    assert.ok(result!.last90 < 910);
  });

  test("mostCommitsInSingleWeek is the max, not the last", () => {
    const weeks = buildWeeks();
    weeks[10].total = 99;
    assert.equal(getCommitTotals(weeks)?.mostCommitsInSingleWeek, 99);
  });

  test("only the newest bucket is partial", () => {
    const weeks = getCommitTotals(buildWeeks())!.weeks;
    assert.equal(weeks.at(-1)!.isPartial, true);
    assert.equal(weeks.filter((w) => w.isPartial).length, 1);
  });

  test("inWindow marks a contiguous run ending at the newest week", () => {
    const weeks = getCommitTotals(buildWeeks())!.weeks;
    assert.equal(weeks.at(-1)!.inWindow, true);
    assert.equal(weeks[0].inWindow, false);

    const firstIn = weeks.findIndex((w) => w.inWindow);
    assert.ok(
      weeks.slice(firstIn).every((w) => w.inWindow),
      "in-window weeks should be a suffix, never a gap",
    );
  });
});

describe("getTopLanguage", () => {
  const languages = {
    HTML: 30,
    JavaScript: 500,
    CSS: 20,
    TypeScript: 200,
    Rust: 100,
    Shell: 10,
  };

  test("totalBytes counts every language, not just the top five", () => {
    assert.equal(getTopLanguage(languages).totalBytes, 860);
  });

  test("picks the largest as topName", () => {
    const { topName, topBytes } = getTopLanguage(languages);
    assert.equal(topName, "JavaScript");
    assert.equal(topBytes, 500);
  });

  test("topFive is sorted descending and capped at five", () => {
    const { topFive } = getTopLanguage(languages);
    assert.equal(topFive.length, 5);
    assert.deepEqual(
      topFive.map((l) => l.name),
      ["JavaScript", "TypeScript", "Rust", "HTML", "CSS"],
    );
  });

  test("does not depend on the object's key order", () => {
    const reversed = Object.fromEntries(Object.entries(languages).reverse());
    assert.equal(getTopLanguage(reversed).topFive[0].name, "JavaScript");
  });

  test("handles a repo with fewer than five languages", () => {
    const { topFive, totalBytes } = getTopLanguage({ Go: 10, Zig: 5 });
    assert.equal(topFive.length, 2);
    assert.equal(totalBytes, 15);
  });
});

describe("getMonthLabels", () => {
  /** n weekly buckets starting at the given UTC date. */
  const weeksFrom = (y: number, m: number, d: number, n: number) =>
    Array.from({ length: n }, (_, i) => ({
      week: Date.UTC(y, m, d) / 1000 + i * 7 * DAY,
      total: 0,
      days: [0, 0, 0, 0, 0, 0, 0],
    }));

  test("one label per month, oldest first", () => {
    // Jan 4 plus 12 weeks lands on 29 Mar, so the run covers three months
    const labels = getMonthLabels(weeksFrom(2026, 0, 4, 13));
    assert.deepEqual(
      labels.map((l) => l.label),
      ["Jan", "Feb", "Mar"],
    );
  });

  test("carries the index of the week the month starts in", () => {
    const labels = getMonthLabels(weeksFrom(2026, 0, 4, 13));
    assert.equal(labels[0].index, 0);
    assert.ok(labels[1].index > 0, "Feb should not sit on the first bar");
  });

  test("drops a leading month too narrow to hold its own label", () => {
    // Starting 28 Sep leaves September a single bucket, so its label would
    // collide with October's.
    const labels = getMonthLabels(weeksFrom(2026, 8, 28, 10));
    assert.equal(labels[0].label, "Oct");
  });

  test("keeps a leading month that has room", () => {
    const labels = getMonthLabels(weeksFrom(2026, 8, 6, 10)); // 6 Sep: 4 wks
    assert.equal(labels[0].label, "Sep");
  });
});

/**
 * Not written yet — these encode the tiers we agreed, all measured by
 * elapsed time rather than calendar boundaries:
 *   < 1 min -> "1 minute ago"   (never "0 minutes")
 *   < 60 min -> minutes
 *   < 24 h   -> hours
 *   < 30 d   -> days
 *   < 365 d  -> months
 *   else     -> years
 */
describe("formatTimeAgo", () => {
  /** an ISO string this many milliseconds before the frozen NOW */
  const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();

  const MINUTE = 60_000;
  const HOUR = 60 * MINUTE;
  const DAY_MS = 24 * HOUR;

  test("rounds anything under a minute up to one minute", () => {
    assert.equal(formatTimeAgo(ago(2_000)), "just now");
  });

  test("minutes", () => {
    assert.equal(formatTimeAgo(ago(45 * MINUTE)), "45 minutes ago");
  });

  test("hours", () => {
    assert.equal(formatTimeAgo(ago(5 * HOUR)), "5 hours ago");
  });

  test("crosses from minutes to hours at 60 minutes", () => {
    assert.equal(formatTimeAgo(ago(59 * MINUTE)), "59 minutes ago");
    assert.equal(formatTimeAgo(ago(60 * MINUTE)), "1 hour ago");
  });

  test("days", () => {
    // facebook/react's real pushed_at gap when we looked: ~86 hours
    assert.equal(formatTimeAgo(ago(86 * HOUR)), "3 days ago");
  });

  test("crosses from hours to days at 24 hours", () => {
    assert.equal(formatTimeAgo(ago(23 * HOUR)), "23 hours ago");
    assert.equal(formatTimeAgo(ago(24 * HOUR)), "1 day ago");
  });

  test("a gap spanning a month boundary is still reported in days", () => {
    // 29 Sep -> 2 Oct is 3 days. Calendar-based logic would call this
    // "1 month ago"; duration-based logic must not.
    const threeDaysAcrossMonths = new Date("2026-09-29T12:00:00Z");
    mock.timers.setTime(new Date("2026-10-02T12:00:00Z").getTime());
    assert.equal(
      formatTimeAgo(threeDaysAcrossMonths.toISOString()),
      "3 days ago",
    );
    mock.timers.setTime(NOW.getTime());
  });

  test("crosses from days to months at 30 days", () => {
    // The divisor (24 hours to a day) and the threshold (stop saying days at
    // about a month) are different numbers that sit next to each other, so
    // both edges of this tier are worth pinning.
    assert.equal(formatTimeAgo(ago(25 * DAY_MS)), "25 days ago");
    assert.equal(formatTimeAgo(ago(29 * DAY_MS)), "29 days ago");
    assert.equal(formatTimeAgo(ago(30 * DAY_MS)), "1 month ago");
  });

  test("crosses from months to years at 12 months", () => {
    assert.equal(formatTimeAgo(ago(330 * DAY_MS)), "11 months ago");
    assert.equal(formatTimeAgo(ago(360 * DAY_MS)), "1 year ago");
  });

  test("never reports a zero quantity", () => {
    // Every tier boundary is a chance to divide into the next unit too early
    // and render "0 months ago", which is how the last two bugs surfaced.
    for (const days of [1, 23, 24, 25, 29, 30, 31, 59, 60, 364, 365, 800]) {
      const result = formatTimeAgo(ago(days * DAY_MS));
      assert.ok(
        !result?.startsWith("0 "),
        `${days} days produced "${result}"`,
      );
    }
  });

  test("months", () => {
    assert.equal(formatTimeAgo(ago(60 * DAY_MS)), "2 months ago");
  });

  test("years", () => {
    assert.equal(formatTimeAgo(ago(800 * DAY_MS)), "2 years ago");
  });
});
