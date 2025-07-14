import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {P2PDataSource} from '../datasources';
import {ApiStorage, ApiStorageRelations} from '../models';

export class ApiStorageRepository extends DefaultCrudRepository<
  ApiStorage,
  typeof ApiStorage.prototype.id,
  ApiStorageRelations
> {
  constructor(
    @inject('datasources.p2p') dataSource: P2PDataSource,
  ) {
    super(ApiStorage, dataSource);
  }
}
