import { startServer } from './server.js';
import { initMongoConnection } from './db/initMongoConnection.js';

(async () => {
  await initMongoConnection();
  startServer();
})();