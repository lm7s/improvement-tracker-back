import express from 'express';

import { logRequest } from './middlewares';
import router from './routes';

class App {
  public express: express.Application;

  constructor() {
    this.express = express();

    // setup methods
    this.setupMiddlewares();
    this.setupRoutes();
  }

  setupMiddlewares() {
    this.express.use(logRequest);
    this.express.use(express.json());
  }

  setupRoutes() {
    this.express.use('/api/v1/', router);
  }
}

export default new App().express;
