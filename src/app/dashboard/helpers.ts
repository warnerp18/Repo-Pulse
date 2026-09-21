import { CommitActivityWeek } from "./_hooks/useFetchDashboard";

const SECONDS_IN_A_DAY = 86400; // 60 * 60 * 24

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

  for (let i = 0; i < data.length; i++) {
    // i represents the week of data
    const currentWeek = data[i];
    lastYear += currentWeek.total;
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

  return { last90, lastYear };
};

export const getTopLanguage = (languages: Record<string, number>) => {
  console.log({ languages });

  let topName = "";
  let topBytes = 0;
  let totalBytes = 0;
  for (const [name, bytes] of Object.entries(languages)) {
    totalBytes += bytes;
    if (bytes > topBytes) {
      console.log({ name });
      topName = name;
      topBytes = bytes;
    }
  }

  return {
    totalBytes,
    topName,
    topBytes,
  };
};
