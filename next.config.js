await import("./src/env.js");

import { withSentryConfig } from "@sentry/nextjs";

/** @type {import("next").NextConfig} */
const coreConfig = {
    images: {
        remotePatterns: [
            {hostname: "utfs.io"}
    ]},
    typescript: {
        ignoreBuildErrors: true, // Useful for separate Error Checking (Sentry)
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    async rewrites() {
      return [
        {
          source: "/ingest/static/:path*",
          destination: "https://eu-assets.i.posthog.com/static/:path*",
        },
        {
          source: "/ingest/:path*",
          destination: "https://eu.i.posthog.com/:path*",
        },
        {
          source: "/ingest/decide",
          destination: "https://eu.i.posthog.com/decide",
        },
      ];
    },
    skipTrailingSlashRedirect: true,
};

// For all available options, see:
// https://github.com/getsentry/sentry-webpack-plugin#options
const config = withSentryConfig(
    coreConfig,
    {
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,

        silent: !process.env.CI,
        reactComponentAnnotation: { enabled: true },
        hideSourceMaps: true,
        disableLogger: true,
        automaticVercelMonitors: true,

        // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
        // tunnelRoute: "/monitoring",
    }
);

export default config;
