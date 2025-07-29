import { startSmtp } from './smtp/server.js';
import { createApiServer } from './api/server.js';
import { cleanupScheduler } from './services/scheduler.js';

console.log('Starting temp-mail backend...');

console.log('🧹 Starting cleanup scheduler...');

startSmtp();

const api = createApiServer();
const apiPort = Number(process.env.API_PORT) || 3001;

api.listen(apiPort, () => {
  console.log(`API listening on :${apiPort}`);
  console.log('Backend ready!');
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down servers...');
  cleanupScheduler.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down servers...');
  cleanupScheduler.stop();
  process.exit(0);
}); 