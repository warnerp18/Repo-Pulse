import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // GitHub avatars. Scoped to the avatar host and its /u/ path rather than
    // the whole domain, so this cannot be used to proxy arbitrary images.
    // `search` is deliberately left off: avatar_url always carries a
    // cache-busting query (?v=4 today), and pinning an exact string would
    // start returning 400s the day GitHub bumps it.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/u/**",
      },
    ],
  },
  turbopack: {
    // Pin the root: a stray package-lock.json in a parent directory makes
    // Next's automatic root detection pick the wrong tree, which breaks
    // file watching (edits stop triggering a rebuild).
    root: path.resolve(import.meta.dirname),
  },
};

export default nextConfig;
