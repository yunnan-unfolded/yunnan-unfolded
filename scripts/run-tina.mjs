import { spawnSync } from "node:child_process";
import { realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { delimiter, dirname, join } from "node:path";

const command = process.argv[2];
const require = createRequire(import.meta.url);
const nextRequire = createRequire(realpathSync(require.resolve("next/package.json")));
const { loadEnvConfig } = nextRequire("@next/env");

// Next loads .env.local automatically, while the Tina CLI does not. Loading it
// here keeps credentials in the project's ignored local environment file and
// never prints or copies their values.
loadEnvConfig(process.cwd(), true);

const isCloudBuild = command === "build" || command === "site-build-cloud";
const searchUiEnabled = process.env.TINA_PUBLIC_SEARCH_ENABLED === "true";
const hasSearchToken = Boolean(process.env.TINA_SEARCH_TOKEN?.trim());

const tinaCli = require.resolve("@tinacms/cli/bin/tinacms");
const commands = {
  dev: ["dev", "-c", "node scripts/run-next-dev.mjs", "--noTelemetry"],
  build: ["build", "--noTelemetry"],
  "build-local": ["dev", "-c", "node -e \"process.exit(0)\"", "--noTelemetry"],
  "site-build-local": ["dev", "-c", "node scripts/run-next-build.mjs", "--noTelemetry"],
  "site-build-cloud": ["build", "-c", "node scripts/run-next-build.mjs", "--noTelemetry"],
};
const args = commands[command];

if (!args) {
  console.error("Usage: node scripts/run-tina.mjs <dev|build|build-local|site-build-local|site-build-cloud>");
  process.exit(1);
}

if (isCloudBuild && searchUiEnabled && !hasSearchToken) {
  console.error("TinaCloud search build stopped: TINA_SEARCH_TOKEN must be configured when TINA_PUBLIC_SEARCH_ENABLED is true.");
  process.exit(1);
}

if (isCloudBuild && (!process.env.NEXT_PUBLIC_TINA_CLIENT_ID || !process.env.TINA_TOKEN)) {
  console.error("TinaCloud build stopped: NEXT_PUBLIC_TINA_CLIENT_ID and TINA_TOKEN must both be configured.");
  process.exit(1);
}

const result = spawnSync(process.execPath, [tinaCli, ...args], {
  env: {
    ...process.env,
    TINA_LOCAL_DRAFT_PREVIEW: command === "dev" ? "true" : "false",
    PATH: `${join(process.cwd(), "node_modules", ".bin")}${delimiter}${dirname(process.execPath)}${delimiter}${process.env.PATH || ""}`,
  },
  stdio: "inherit",
});
process.exit(result.status ?? 1);
