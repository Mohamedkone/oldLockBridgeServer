import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {P2PDataSource} from '../datasources';
import {Livebridge, LivebridgeRelations} from '../models';

export class LivebridgeRepository extends DefaultCrudRepository<
  Livebridge,
  typeof Livebridge.prototype.id,
  LivebridgeRelations
> {
  constructor(
    @inject('datasources.p2p') dataSource: P2PDataSource,
  ) {
    super(Livebridge, dataSource);
  }
}
