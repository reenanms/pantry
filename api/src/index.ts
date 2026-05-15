import { buildServer } from './server.js';

const PORT = Number(process.env.API_PORT) || 6150;
const HOST = process.env.API_HOST || '0.0.0.0';

async function main() {
  const app = buildServer();

  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`Pantry is running at http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
