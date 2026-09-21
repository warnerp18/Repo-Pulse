/**
 * Defines the brand gradient once per document as `url(#g)`.
 * SVG id references resolve document-wide, so any icon on any page can use it.
 * Rendered from the root layout; renders nothing visible.
 */
const GradientDefs = () => (
  <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="var(--gradient-start)" />
        <stop offset="0.55" stopColor="var(--gradient-mid)" />
        <stop offset="1" stopColor="var(--gradient-end)" />
      </linearGradient>
    </defs>
  </svg>
);

export default GradientDefs;
