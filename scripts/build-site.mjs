import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const supportedModes = new Set(["github-project", "custom-domain"]);
const mode = process.argv[2];

if (!supportedModes.has(mode)) {
  console.error("Usage: node scripts/build-site.mjs <github-project|custom-domain>");
  process.exit(1);
}

const tinaRunner = fileURLToPath(new URL("./run-tina.mjs", import.meta.url));
const tinaCommand = process.env.TINA_BUILD_CLOUD === "true" ? "site-build-cloud" : "site-build-local";
const tinaResult = spawnSync(process.execPath, [tinaRunner, tinaCommand], {
  env: { ...process.env, SITE_DEPLOYMENT_MODE: mode },
  stdio: "inherit",
});
process.exit(tinaResult.status ?? 1);
