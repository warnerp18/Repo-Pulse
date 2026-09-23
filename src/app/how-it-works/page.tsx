import type { Metadata } from "next";
import styles from "./how-it-works.module.css";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Where Repo Pulse's numbers come from, what each one actually counts, and the trade-offs behind how it is built.",
};

const sections = [
  { id: "sources", label: "Where the numbers come from" },
  { id: "meaning", label: "What the numbers mean" },
  { id: "built", label: "How it's built" },
  { id: "look", label: "The look" },
  { id: "a11y", label: "Accessibility" },
  { id: "tradeoffs", label: "Trade-offs" },
  { id: "limits", label: "Limits worth knowing" },
];

const HowItWorks = () => {
  return (
    <div>
      <p className={styles.eyebrow}>
        Engineering analytics for any public repo
      </p>
      <h1 className="headline headline-sm">
        Five views of a repository, and what each number actually counts
      </h1>
      <p className="lede">
        Paste a public GitHub repository and Repo Pulse gives you five views of
        it in one screen: how often it&apos;s committed to, who&apos;s doing the
        work, what it&apos;s written in, how much changed recently, and which
        files are absorbing that change.
      </p>

      <div className={styles.bodyGrid}>
        <nav className={styles.nav} aria-label="Sections">
          <p className={styles.navTitle}>On this page</p>
          <ol className={styles.navList}>
            {sections.map(({ id, label }) => (
              <li key={id}>
                <a className={styles.list} href={`#${id}`}>
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className={styles.prose}>
          <section id="sources">
            <h2>Where the numbers come from</h2>
            <div className={styles.sectionRule} />
            <p>
              Everything comes from GitHub&apos;s public API. One request to
              this app fans out into five requests to GitHub, in parallel, and
              returns as a single response. Recent answers are reused for a
              short while so the same repository isn&apos;t re-fetched on every
              visit. Nothing about you is stored, and nothing is kept beyond
              that.
            </p>
            <dl className={styles.sources}>
              <div className={styles.source}>
                <dt>Commit activity</dt>
                <dd>The last 52 weeks of commits, bucketed by week.</dd>
              </div>
              <div className={styles.source}>
                <dt>Contributors</dt>
                <dd>The top contributors, ranked by commit count.</dd>
              </div>
              <div className={styles.source}>
                <dt>Languages</dt>
                <dd>
                  Bytes of code per language, which is how GitHub measures the
                  mix.
                </dd>
              </div>
              <div className={styles.source}>
                <dt>Churn</dt>
                <dd>
                  The files absorbing the most change in the last 90 days, with
                  lines added and removed.
                </dd>
              </div>
              <div className={styles.source}>
                <dt>Repository</dt>
                <dd>
                  The description, the default branch, and when it was last
                  pushed to.
                </dd>
              </div>
            </dl>
            <p>
              Each section carries its own success or failure. If GitHub
              rate-limits one of them, the other four still render: a partial
              dashboard rather than an error page.
            </p>
          </section>

          <section id="meaning">
            <h2>What the numbers actually mean</h2>
            <div className={styles.sectionRule} />
            <p>
              Analytics tools tend to show you a number without saying what it
              counts. Four of these are worth being precise about.
            </p>
            <div className={styles.facts}>
              <div className={styles.fact}>
                <div className={styles.figure}>
                  ~25%<small>over git log</small>
                </div>
                <div>
                  <h3>Commits in the last 90 days</h3>
                  <p className="muted">
                    Comes from GitHub&apos;s weekly activity statistics. That
                    endpoint counts more than the commits sitting on the default
                    branch. For React it reports about 25% more than{" "}
                    <code className="mono">git log</code> on{" "}
                    <code className="mono">main</code> would, and GitHub
                    doesn&apos;t document what it includes. It&apos;s used here
                    because the chart below it is drawn from the same data, and
                    a headline that disagreed with the bars underneath it would
                    be worse than one that&apos;s consistently approximate.
                  </p>
                </div>
              </div>
              <div className={styles.fact}>
                <div className={styles.figure}>
                  300<small>hard ceiling</small>
                </div>
                <div>
                  <h3>Files changed is capped</h3>
                  <p className="muted">
                    GitHub&apos;s comparison endpoint returns at most 300 files
                    and gives no total, and paginating doesn&apos;t extend it.
                    Any repo showing <code className="mono">300+</code> changed
                    more than that, and the real figure isn&apos;t available.
                  </p>
                </div>
              </div>
              <div className={styles.fact}>
                <div className={styles.figure}>
                  0<small>lockfiles ranked</small>
                </div>
                <div>
                  <h3>Churn hotspots exclude lockfiles</h3>
                  <p className="muted">
                    <code className="mono">package-lock.json</code>,{" "}
                    <code className="mono">yarn.lock</code>,{" "}
                    <code className="mono">Cargo.lock</code> and their
                    equivalents in a dozen other ecosystems. They are
                    machine-written, and a single dependency update rewrites
                    thousands of lines without anyone touching the
                    project&apos;s own code. Left in, they top the ranking on
                    almost every repo: on React,{" "}
                    <code className="mono">yarn.lock</code> alone changed by
                    more lines than any hand-written file. They are still
                    counted in <strong>Files changed</strong>, because they did
                    change. The two numbers measure different things on purpose.
                  </p>
                </div>
              </div>
              <div className={styles.fact}>
                <div className={styles.figure}>
                  90<small>whole UTC days</small>
                </div>
                <div>
                  <h3>The 90-day window</h3>
                  <p className="muted">
                    Ninety whole UTC days including today, not 90 &times; 24
                    hours from the moment you loaded the page. The current week
                    in the chart is drawn as an open outline rather than a
                    filled bar, because it hasn&apos;t finished yet; reading a
                    Sunday-start week on a Monday isn&apos;t a drop in activity.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="built">
            <h2>How it&apos;s built</h2>
            <div className={styles.sectionRule} />
            <div className={styles.notes}>
              <div className={styles.note}>
                <h3>A backend-for-frontend</h3>
                <p className="muted">
                  The browser makes one request to this app&apos;s own API,
                  which aggregates the five GitHub calls and returns only the
                  fields the screen uses. GitHub&apos;s raw responses are
                  enormous (full commit objects with signatures and diff
                  patches), and shipping them to the browser to discard 95%
                  would be the easy, wrong choice.
                </p>
              </div>
              <div className={styles.note}>
                <h3>One call for churn, not a hundred</h3>
                <p className="muted">
                  &ldquo;Which files changed in the last 90 days&rdquo; naively
                  means fetching every commit and then every commit&apos;s file
                  list: over a hundred requests for an active repo, against a
                  budget shared by every visitor. Instead it finds the commit at
                  the 90-day boundary and makes a single comparison call against{" "}
                  <code className="mono">HEAD</code>, which returns cumulative
                  per-file statistics for the whole range.
                </p>
              </div>
              <div className={styles.note}>
                <h3>No charting library</h3>
                <p className="muted">
                  The commit chart is 52 elements sized by percentage. The
                  language bar is the same idea horizontally. A charting
                  dependency would have added weight to draw rectangles.
                </p>
              </div>
            </div>
          </section>

          <section id="look">
            <h2>The look</h2>
            <div className={styles.sectionRule} />
            <p className="muted">
              The visual design is an homage to the GitHub Universe 2018
              conference site, a fitting reference for a tool about GitHub
              repositories.
            </p>
            <p className="muted">
              What carried over: the near-black blue-gray ground, the drifting
              starfield, the slow pulse on loading states, and the transparent
              input sitting on a single hairline rule with an arrow that slides
              on hover.
            </p>
            <p className="muted">
              What didn&apos;t: Universe ran its gradient orange through coral
              to pink and filled its buttons with it. Here the gradient runs
              violet through pink to orange and appears as a 1px border, so
              every panel is outlined rather than flooded, which keeps the
              numbers, not the chrome, as the brightest thing on screen.
              Universe set its headings in uppercase with wide tracking; these
              are set tight and heavy, with the uppercase-and-spaced idiom kept
              only for the small labels above each panel.
            </p>
          </section>

          <section id="a11y">
            <h2>Accessibility</h2>
            <div className={styles.sectionRule} />
            <p className="muted">
              Charts are where dashboards usually stop being accessible. Color
              carries the meaning, hover reveals the detail, and a screen reader
              gets a wall of empty divs.
            </p>
            <div className={styles.notes}>
              <div className={styles.note}>
                <h3>Every bar names itself</h3>
                <p className="muted">
                  Each column in the commit chart carries the week and the
                  commit count as its accessible name, so the data is in the
                  accessible tree rather than implied by height. The hover
                  tooltip is a visual convenience on top of that, not the only
                  way to read it.
                </p>
              </div>
              <div className={styles.note}>
                <h3>The whole chart is also a table</h3>
                <p className="muted">
                  One collapsible panel underneath gives every week and count as
                  rows. It&apos;s one tab stop instead of fifty-two, and
                  it&apos;s copyable, which the chart isn&apos;t.
                </p>
              </div>
              <div className={styles.note}>
                <h3>Color is never the only signal</h3>
                <p className="muted">
                  Every pair of colors that has to be told apart was checked
                  under simulated color blindness rather than judged by eye. The
                  two halves of the commit chart stay clearly distinct, as do
                  the five language segments. Where a pair genuinely can&apos;t
                  be separated, as with additions and deletions, the numbers
                  always appear beside the bar.
                </p>
              </div>
              <div className={styles.note}>
                <h3>Contrast is measured, not guessed</h3>
                <p className="muted">
                  Every mark that carries data clears a 3:1 ratio against the
                  background, including the deliberately recessive ones. The
                  dimmed half of the commit chart looks better a shade fainter.
                  It isn&apos;t, because that would drop it below the threshold.
                </p>
              </div>
              <div className={styles.note}>
                <h3>Motion is optional</h3>
                <p className="muted">
                  The drifting starfield, the loading pulse and the skeleton
                  shimmer all stop for anyone whose system asks for reduced
                  motion.
                </p>
              </div>
              <div className={styles.note}>
                <h3>Keyboard focus is visible</h3>
                <p className="muted">
                  Every link, button and input shows a clear focus ring, and the
                  back link on the dashboard meets the minimum target size for
                  touch.
                </p>
              </div>
              <div className={styles.note}>
                <h3>What hasn&apos;t been checked</h3>
                <p className="muted">
                  This section describes markup and measurement. It isn&apos;t a
                  conformance claim: the site hasn&apos;t been through a screen
                  reader, and heading order, the muted body text&apos;s contrast
                  and the form&apos;s error announcement haven&apos;t been
                  audited.
                </p>
              </div>
            </div>
          </section>

          <section id="tradeoffs">
            <h2>Trade-offs</h2>
            <div className={styles.sectionRule} />
            <p>
              Most of these had a defensible alternative. The reasoning matters
              more than the choice.
            </p>
            <div className={styles.notes}>
              <div className={styles.note}>
                <h3>Fan out first, ask questions later</h3>
                <p className="muted">
                  All five GitHub requests fire in parallel, and only then does
                  the app check whether the repository exists. Checking first
                  would save four requests when someone mistypes a name, but it
                  would add a round trip to every successful load, to guard
                  against the rarer case. Requests that wait on each other are
                  the most common cause of a slow page, and a wasted request
                  costs less than a slow one.
                </p>
                <p className={styles.verdict}>
                  <span className={styles.chose}>parallel fan-out</span>
                  <span className={styles.sep}>over</span>
                  <span className={styles.over}>existence check first</span>
                </p>
              </div>
              <div className={styles.note}>
                <h3>Consistent over precise</h3>
                <p className="muted">
                  The commits figure and the chart beneath it disagree with{" "}
                  <code className="mono">git log</code> by about 25%, because
                  GitHub&apos;s statistics endpoint counts more than the default
                  branch. A different endpoint gives the exact number. Using it
                  would mean a headline figure that contradicts the bars
                  directly below it: a reader who added up the chart would find
                  the tile wrong. Two sources that disagree on screen is worse
                  than one source that&apos;s consistently approximate and
                  labeled as such.
                </p>
                <p className={styles.verdict}>
                  <span className={styles.chose}>one consistent source</span>
                  <span className={styles.sep}>over</span>
                  <span className={styles.over}>the exact commit count</span>
                </p>
              </div>
              <div className={styles.note}>
                <h3>Percentages that mean what you&apos;d assume</h3>
                <p className="muted">
                  The language breakdown shows the top five, but every
                  percentage divides by <em>all</em> the bytes in the repo. So
                  the five don&apos;t add to 100%, and a gray segment fills the
                  difference. Dividing by just those five would make the bar
                  fill neatly and the numbers total 100, at the cost of every
                  percentage quietly overstating the language&apos;s real share.
                </p>
                <p className={styles.verdict}>
                  <span className={styles.chose}>divide by all bytes</span>
                  <span className={styles.sep}>over</span>
                  <span className={styles.over}>a bar that fills to 100%</span>
                </p>
              </div>
              <div className={styles.note}>
                <h3>An accessible table instead of 52 tab stops</h3>
                <p className="muted">
                  Making each bar keyboard-focusable would put the tooltip
                  within reach of a keyboard, and drop 52 stops between one
                  panel and the next. Instead every bar describes itself to a
                  screen reader, and the whole chart is available as a table in
                  one stop. Conformance isn&apos;t the same as usability.
                </p>
                <p className={styles.verdict}>
                  <span className={styles.chose}>one table stop</span>
                  <span className={styles.sep}>over</span>
                  <span className={styles.over}>52 focusable bars</span>
                </p>
              </div>
              <div className={styles.note}>
                <h3>Time measured in durations, not calendar pages</h3>
                <p className="muted">
                  &ldquo;Last push 3 days ago&rdquo; is computed from elapsed
                  time, never by comparing month numbers. A push on 29 September
                  read on 2 October is three days old, but it&apos;s also
                  &ldquo;a different month&rdquo;, and logic built on that
                  comparison would call it a month. That bug would be invisible
                  for twenty-odd days at a stretch and then wrong for a few.
                </p>
                <p className={styles.verdict}>
                  <span className={styles.chose}>elapsed time</span>
                  <span className={styles.sep}>over</span>
                  <span className={styles.over}>comparing month numbers</span>
                </p>
              </div>
              <div className={styles.note}>
                <h3>Caching before rate limiting</h3>
                <p className="muted">
                  Every visitor shares one GitHub credential, so the question
                  isn&apos;t whether someone could exhaust it but which tool to
                  reach for. Responses are cached per repository, so the cost
                  scales with how many <em>different</em> repos people look at
                  rather than with traffic, and it handles the realistic case
                  directly: someone impatiently reloading the same repo is
                  served from cache and never touches GitHub. Per-IP rate
                  limiting is the answer to someone hostile. Caching is the
                  answer to someone impatient, and almost everyone is the second
                  one.
                </p>
                <p className={styles.verdict}>
                  <span className={styles.chose}>per-repo caching</span>
                  <span className={styles.sep}>over</span>
                  <span className={styles.over}>per-IP rate limiting</span>
                </p>
              </div>
              <div className={styles.note}>
                <h3>
                  Cached at the request layer, not in the server&apos;s memory
                </h3>
                <p className="muted">
                  There are two ways to cache this: hold the assembled answer in
                  the running server&apos;s memory, or cache the outbound
                  requests to GitHub themselves. This app runs serverless, where
                  there is no single long-lived process: two people looking up
                  the same repository a minute apart can be served by different
                  machines, and anything one of them holds in memory is
                  invisible to the other. An in-memory cache would look correct
                  in development and quietly do nothing in production. Caching
                  the requests instead means every instance shares the same
                  copy, and each GitHub endpoint can carry its own lifetime:
                  commit statistics are a weekly rollup and can sit still for an
                  hour, while &ldquo;last push&rdquo; is the one number a reader
                  would notice going stale, so it refreshes far sooner.
                </p>
                <p className={styles.verdict}>
                  <span className={styles.chose}>request-layer cache</span>
                  <span className={styles.sep}>over</span>
                  <span className={styles.over}>in-process memory</span>
                </p>
              </div>
              <div className={styles.note}>
                <h3>REST, not GraphQL</h3>
                <p className="muted">
                  GitHub offers both, and GraphQL would let the five requests
                  become one. For a project this size the setup (a client, a
                  schema, generated types, a caching layer) costs more than it
                  saves against five well-understood REST endpoints that fan out
                  in parallel anyway. The app&apos;s own API is REST for the
                  same reason: one route handler, one shape, no build step.
                </p>
                <p className={styles.verdict}>
                  <span className={styles.chose}>five REST calls</span>
                  <span className={styles.sep}>over</span>
                  <span className={styles.over}>one GraphQL query</span>
                </p>
              </div>
              <div className={styles.note}>
                <h3>Counts and lists are different numbers, on purpose</h3>
                <p className="muted">
                  GitHub hands out contributors one page at a time, so the
                  people shown in the panel are the top few of the first page,
                  while the count beside &ldquo;Contributors&rdquo; is the real
                  total, read from a separate request rather than by counting
                  the rows on screen. A dashboard that counted what it displayed
                  would report 30 for almost every popular repository.
                </p>
                <p className={styles.verdict}>
                  <span className={styles.chose}>a separate count request</span>
                  <span className={styles.sep}>over</span>
                  <span className={styles.over}>counting the rows shown</span>
                </p>
              </div>
              <div className={styles.note}>
                <h3>A panel that can&apos;t load says so</h3>
                <p className="muted">
                  Each of the five sections is fetched separately and reports
                  its own outcome, so one failure never blanks the page. They
                  also distinguish between <em>nothing to show</em> and{" "}
                  <em>something went wrong</em>: a repository younger than
                  ninety days has no churn to report, which is a fact about the
                  repository, while a request that failed is a fault and is
                  shown as one.
                </p>
                <p className={styles.verdict}>
                  <span className={styles.chose}>per-section outcomes</span>
                  <span className={styles.sep}>over</span>
                  <span className={styles.over}>one page-level error</span>
                </p>
              </div>
            </div>
          </section>

          <section id="limits">
            <h2>Limits worth knowing</h2>
            <div className={styles.sectionRule} />
            <ul className={styles.limits}>
              <li>
                Public repositories only. A private repo looks identical to one
                that doesn&apos;t exist, so you&apos;ll see the same message.
              </li>
              <li>
                GitHub computes its activity statistics on demand. The first
                request for a rarely-visited repo can come back empty while that
                runs.
              </li>
              <li>
                Language percentages are shares of bytes, not of files or lines,
                and vendored code counts.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
