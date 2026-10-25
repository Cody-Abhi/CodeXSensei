import { createApp } from './app';

const port = Number(process.env.PORT ?? 8080);
const app = createApp();

app.listen(port, () => {
  console.info(`PlanPop server listening on http://localhost:${port}`);
});
