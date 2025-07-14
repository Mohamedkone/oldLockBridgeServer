import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {P2PDataSource} from '../datasources';
import {DefaultStorage, DefaultStorageRelations} from '../models';

export class DefaultStorageRepository extends DefaultCrudRepository<
  DefaultStorage,
  typeof DefaultStorage.prototype.id,
  DefaultStorageRelations
> {
  constructor(
    @inject('datasources.p2p') dataSource: P2PDataSource,
  ) {
    super(DefaultStorage, dataSource);
  }
}
