import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Project rule: no parent-relative imports. `../../helpers` tells you
  // nothing about what it resolves to and silently breaks the moment a file
  // moves — which is exactly what happened when DashBoard moved out of
  // page.tsx. `@/` is anchored to src/, so an import means the same thing
  // wherever the file lives and moving a file is a cut and paste.
  // Same-directory `./` imports are still fine: they move with the folder.
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*", "../**"],
              message:
                "Use the @/ alias instead of a parent-relative import (e.g. @/app/dashboard/helpers).",
            },
          ],
        },
      ],
    },
  },

  // node:test executes these files directly and does not read tsconfig
  // `paths`, so `@/` would not resolve at runtime. Tests stay relative.
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: { "no-restricted-imports": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
