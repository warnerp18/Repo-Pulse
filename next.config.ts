import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the root: a stray package-lock.json in a parent directory makes
    // Next's automatic root detection pick the wrong tree, which breaks
    // file watching (edits stop triggering a rebuild).
    root: path.resolve(import.meta.dirname),
  },
};

export default nextConfig;
