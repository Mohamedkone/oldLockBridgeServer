import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {P2PDataSource} from '../datasources';
import {Storage, StorageRelations} from '../models';

export class StorageRepository extends DefaultCrudRepository<
  Storage,
  typeof Storage.prototype.id,
  StorageRelations
> {
  constructor(
    @inject('datasources.p2p') dataSource: P2PDataSource,
  ) {
    super(Storage, dataSource);
  }
}
