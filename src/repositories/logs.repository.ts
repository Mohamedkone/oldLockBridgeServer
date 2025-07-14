import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {P2PDataSource} from '../datasources';
import {Logs, LogsRelations} from '../models';

export class LogsRepository extends DefaultCrudRepository<
  Logs,
  typeof Logs.prototype.logId,
  LogsRelations
> {
  constructor(
    @inject('datasources.p2p') dataSource: P2PDataSource,
  ) {
    super(Logs, dataSource);
  }
}
