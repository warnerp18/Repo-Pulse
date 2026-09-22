import type { CommitActivityWeek } from "./_hooks/useFetchDashboard";

const SECONDS_IN_A_DAY = 86400; // 60 * 60 * 24

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
/* Approximations, and each one a whole number of the unit below it. A year
   of 365 days against a month of 30 leaves a gap where 360-364 days is
   neither a year nor under twelve months, and renders "12 months ago". */
const MONTH = 30 * DAY;
const YEAR = 12 * MONTH;

/**
 * Tiers for formatTimeAgo, largest first — the first one an elapsed time
 * reaches wins. One number per unit: the length of the unit is also the
 * threshold for using it, so there is no second constant to get backwards.
 * "How long ago" is a duration question, not a calendar one, so a gap that
 * crosses a month boundary is still reported in days.
 */
const UNITS = [
  { unit: "year", ms: YEAR },
  { unit: "month", ms: MONTH },
  { unit: "day", ms: DAY },
  { unit: "hour", ms: HOUR },
  { unit: "minute", ms: MINUTE },
] as const satisfies readonly { unit: Intl.RelativeTimeFormatUnit; ms: number }[];

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "always" });

/** A week bucket plus the two flags the chart paints from. */
export type ChartWeek = CommitActivityWeek & {
  inWindow: boolean;
  isPartial: boolean;
};

/** GitHub's week is a UTC Sunday in SECONDS; Date wants milliseconds, and
    the label must be read back in UTC or a viewer west of UTC sees every
    bucket shifted to the previous day. */
export const formatWeek = (week: number) =>
  new Date(week * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

export const getCommitTotals = (data: CommitActivityWeek[]) => {
  if (!data.length) return null;

  const d = new Date();
  const startOfToday = Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
  ); // ex: 1789862400000 Sept 20 UTC Date

  const startOfTodayInSeconds = startOfToday / 1000;
  const cutoff = startOfToday / 1000 - 89 * SECONDS_IN_A_DAY; // ex: 1782172800 June 23 UTC Date

  let last90 = 0;
  let lastYear = 0;
  let mostCommitsInSingleWeek = 0;
  const weeks: ChartWeek[] = [];

  for (let i = 0; i < data.length; i++) {
    // i represents the week of data
    const currentWeek = data[i];
    lastYear += currentWeek.total;

    // The chart needs the same two facts this loop already derives, so it
    // tags each week here rather than recomputing the cutoff per bar.
    // A week counts as in-window if any part of it reaches past the cutoff,
    // and the newest bucket is always the current, unfinished week.
    weeks.push({
      ...currentWeek,
      inWindow: currentWeek.week + 6 * SECONDS_IN_A_DAY >= cutoff,
      isPartial: i === data.length - 1,
    });

    if (currentWeek.total > mostCommitsInSingleWeek) {
      mostCommitsInSingleWeek = currentWeek.total;
    }

    if (
      // this makes sure we aren't in a date past 90 days
      currentWeek.week >= cutoff &&
      // if below is true then we aren't in todays week. If below is false we are in today's week and the week isn't finished and we don't want to count scheduled commits that are in the future
      currentWeek.week + 6 * SECONDS_IN_A_DAY <= startOfTodayInSeconds
    ) {
      last90 += currentWeek.total;
    } else {
      for (let j = 0; j < currentWeek.days.length; j++) {
        // j represents the weekday ex: 0 is sunday & 6 is saturday

        const currentDaysCommits = currentWeek.days[j]; // will be the total commits that day

        if (
          currentWeek.week + j * SECONDS_IN_A_DAY >= cutoff &&
          startOfTodayInSeconds >= currentWeek.week + j * SECONDS_IN_A_DAY
        ) {
          last90 += currentDaysCommits;
        }
      }
    }
  }

  return { last90, lastYear, mostCommitsInSingleWeek, weeks };
};

export const getTopLanguage = (languages: Record<string, number>) => {
  let topName = "";
  let topBytes = 0;
  let totalBytes = 0;

  const topFive = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, bytes]) => ({ name, bytes }));

  for (const [name, bytes] of Object.entries(languages)) {
    totalBytes += bytes;
    if (bytes > topBytes) {
      topName = name;
      topBytes = bytes;
    }
  }

  return {
    totalBytes,
    topName,
    topBytes,
    topFive,
  };
};

/** Month names for the axis, taken from the weeks actually plotted, oldest
    first — one label the first time each month appears, carrying the index
    of that week so the axis can place the label under its own bar rather
    than spacing the labels evenly. */
export const getMonthLabels = (weeks: CommitActivityWeek[]) => {
  const labels: { label: string; index: number }[] = [];
  let previous = "";

  weeks.forEach((week, index) => {
    const label = new Date(week.week * 1000).toLocaleDateString("en-US", {
      month: "short",
      timeZone: "UTC",
    });
    if (label !== previous) {
      labels.push({ label, index });
      previous = label;
    }
  });

  // The 52-week window starts mid-month, so the first month can hold a single
  // week — close enough to the next label that the two overlap. A one- or
  // two-week leading month is not worth a label; every interior month has
  // four or five weeks and clears this comfortably.
  if (labels.length > 1 && labels[1].index - labels[0].index < 3) {
    labels.shift();
  }

  return labels;
};

/** An ISO 8601 timestamp as a relative phrase: "3 days ago". */
export const formatTimeAgo = (isoDate: string) => {
  if (!isoDate) return null;

  const elapsed = Math.abs(Date.now() - new Date(isoDate).getTime());

  for (const { unit, ms } of UNITS) {
    const value = Math.floor(elapsed / ms);
    if (value >= 1) return rtf.format(-value, unit);
  }

  return "just now";
};
