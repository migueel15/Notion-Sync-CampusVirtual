import "./server.js";
import { logInfo } from "./logger.js";
import { startSyncScheduler, syncAllUsers } from "./cron.js";
import { syncUser } from "./sync.js";

const sync = process.env.API_ENDPOINT ? undefined : syncUser;
startSyncScheduler(sync);

logInfo("Notion Sync Multi-User Server Started", { context: "bootstrap" });
logInfo("API Server running with /sync-user endpoint", {
  context: "bootstrap",
});
logInfo("Cron jobs scheduled for automatic syncing", { context: "bootstrap" });

await syncAllUsers(sync);
