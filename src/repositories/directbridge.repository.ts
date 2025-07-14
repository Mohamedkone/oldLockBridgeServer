import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {P2PDataSource} from '../datasources';
import {Directbridge, DirectbridgeRelations} from '../models';

export class DirectbridgeRepository extends DefaultCrudRepository<
  Directbridge,
  typeof Directbridge.prototype.id,
  DirectbridgeRelations
> {
  constructor(
    @inject('datasources.p2p') dataSource: P2PDataSource,
  ) {
    super(Directbridge, dataSource);
  }
}
