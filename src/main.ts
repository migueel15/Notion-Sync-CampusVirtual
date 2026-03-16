import "./server.js";
import "./cron.js";
import { logInfo } from "./logger.js";
import { syncAllUsers } from "./cron.js";

logInfo("Notion Sync Multi-User Server Started", { context: "bootstrap" });
logInfo("API Server running with /sync-user endpoint", {
  context: "bootstrap",
});
logInfo("Cron jobs scheduled for automatic syncing", { context: "bootstrap" });

await syncAllUsers();
