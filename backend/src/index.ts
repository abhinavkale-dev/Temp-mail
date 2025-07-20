import { startSmtp } from './smtp/server.js';
import { createApiServer } from './api/server.js';

console.log('Starting temp-mail backend...');

startSmtp();

const api = createApiServer();
const apiPort = Number(process.env.API_PORT) || 3001;

api.listen(apiPort, () => {
  console.log(`API listening on :${apiPort}`);
  console.log('Backend ready!');
}); 