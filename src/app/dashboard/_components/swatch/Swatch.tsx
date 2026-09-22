import styles from "./swatch.module.css";

/**
 * Every colour a swatch is allowed to be. Keys are roles, not hues, so a
 * palette change happens once in globals.css and nothing here moves.
 */
export const SWATCH_COLORS = {
  "chart-in": "var(--chart-in)",
  "chart-out": "var(--chart-out)",
  "lang-1": "var(--lang-1)",
  "lang-2": "var(--lang-2)",
  "lang-3": "var(--lang-3)",
  "lang-4": "var(--lang-4)",
  "lang-5": "var(--lang-5)",
  add: "var(--add-fill)",
  del: "var(--del-fill)",
} as const;

export type SwatchColor = keyof typeof SWATCH_COLORS;
export type SwatchVariant = "solid" | "outline";

/**
 * The language slots in rank order — index 0 is the largest language. Kept
 * as a list so a breakdown can map over its slices without hardcoding keys,
 * and so the order stays fixed: the palette is stepped for adjacency, and
 * reordering it puts hard-to-separate hues next to each other.
 */
export const LANGUAGE_SWATCHES = [
  "lang-1",
  "lang-2",
  "lang-3",
  "lang-4",
  "lang-5",
] as const satisfies readonly SwatchColor[];

/**
 * The same five in rank order, resolved to their CSS values — for marks that
 * are painted directly rather than through <Swatch>, like a stacked bar's
 * segments. Derived from the list above so the bar and its legend can never
 * disagree about which colour a rank gets.
 */
export const LANGUAGE_COLORS = LANGUAGE_SWATCHES.map(
  (key) => SWATCH_COLORS[key],
);

const Swatch = ({
  color,
  variant = "solid",
}: {
  color: SwatchColor;
  /** `solid` fills the square; `outline` draws a dashed one, for a pending state. */
  variant?: SwatchVariant;
}) => {
  const isOutline = variant === "outline";
  const value = SWATCH_COLORS[color];

  return (
    <span
      className={[styles.swatch, isOutline && styles.outline]
        .filter(Boolean)
        .join(" ")}
      style={isOutline ? { borderColor: value } : { backgroundColor: value }}
      aria-hidden="true"
    />
  );
};

export default Swatch;
