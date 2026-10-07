import { APP_TIMEZONE } from "./config/timeZone";
import { connect } from "./db/connection";
import { createApp } from "./app";

await connect();

const app = createApp();
const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🕓 Day keys resolved in ${APP_TIMEZONE}`);
});
