/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
    typescript: {
        ignoreBuildErrors: true, // Useful for separate Error Checking
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default config;
