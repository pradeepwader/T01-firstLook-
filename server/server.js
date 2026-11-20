const env = require("./src/config/env");
const connectDB = require("./src/config/db");
const app = require("./src/app");

(async () => {
  await connectDB();
  const server = app.listen(env.port, () =>
    console.log(`[T01] API running on http://localhost:${env.port} (${env.nodeEnv}, payments: ${env.payment.mode})`)
  );
  const shutdown = () => server.close(() => process.exit(0));
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
})();
