import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const supportedModes = new Set(["github-project", "custom-domain"]);
const mode = process.argv[2];

if (!supportedModes.has(mode)) {
  console.error("Usage: node scripts/build-site.mjs <github-project|custom-domain>");
  process.exit(1);
}

const require = createRequire(import.meta.url);
const nextCli = require.resolve("next/dist/bin/next");
const result = spawnSync(process.execPath, [nextCli, "build"], {
  env: { ...process.env, SITE_DEPLOYMENT_MODE: mode },
  stdio: "inherit",
});

process.exit(result.status ?? 1);
