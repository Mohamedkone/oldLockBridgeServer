import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
require('dotenv').config()
const config = {
  name: process.env.MYSQL_DB_NAME,
  connector: process.env.MYSQL_DB_CONNECTOR,
  url: process.env.MYSQL_DB_URL,
  host: process.env.MYSQL_DB_HOST,
  port: process.env.MYSQL_DB_PORT,
  user: process.env.MYSQL_DB_USER,
  password: process.env.MYSQL_DB_PASSWORD,
  database: process.env.MYSQL_DB_DB
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class P2PDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'p2p';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.p2p', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
