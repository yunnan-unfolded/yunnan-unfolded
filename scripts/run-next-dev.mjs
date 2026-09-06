import { spawnSync } from "node:child_process";
import { realpathSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextCli = realpathSync(require.resolve("next/dist/bin/next"));

// Set the draft-preview flag on the process that actually runs Next.js.
// This avoids platform-specific inline environment syntax and prevents the
// Tina CLI command shell from dropping the flag on Windows.
const result = spawnSync(process.execPath, [nextCli, "dev", ...process.argv.slice(2)], {
  env: {
    ...process.env,
    NODE_ENV: "development",
    TINA_LOCAL_DRAFT_PREVIEW: "true",
  },
  stdio: "inherit",
});

process.exit(result.status ?? 1);
