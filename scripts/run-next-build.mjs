import { spawnSync } from "node:child_process";
import { realpathSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextCli = realpathSync(require.resolve("next/dist/bin/next"));
const result = spawnSync(process.execPath, [nextCli, "build"], {
  env: { ...process.env, NODE_ENV: "production" },
  stdio: "inherit",
});
process.exit(result.status ?? 1);
