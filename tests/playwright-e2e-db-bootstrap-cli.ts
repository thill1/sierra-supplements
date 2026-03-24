import { bootstrapPlaywrightE2eDatabase } from "./playwright-e2e-db-bootstrap";

bootstrapPlaywrightE2eDatabase().catch((e) => {
    console.error(e);
    process.exit(1);
});
