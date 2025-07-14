import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {P2PDataSource} from '../datasources';
import {VaultData, VaultDataRelations} from '../models';

export class VaultDataRepository extends DefaultCrudRepository<
  VaultData,
  typeof VaultData.prototype.id,
  VaultDataRelations
> {
  constructor(
    @inject('datasources.p2p') dataSource: P2PDataSource,
  ) {
    super(VaultData, dataSource);
  }
}
