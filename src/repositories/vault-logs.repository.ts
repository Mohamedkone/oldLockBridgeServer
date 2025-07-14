import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {P2PDataSource} from '../datasources';
import {VaultLogs, VaultLogsRelations} from '../models';

export class VaultLogsRepository extends DefaultCrudRepository<
  VaultLogs,
  typeof VaultLogs.prototype.logId,
  VaultLogsRelations
> {
  constructor(
    @inject('datasources.p2p') dataSource: P2PDataSource,
  ) {
    super(VaultLogs, dataSource);
  }
}
