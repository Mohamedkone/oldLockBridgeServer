import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {P2PDataSource} from '../datasources';
import {NodesFls, NodesFlsRelations} from '../models';

export class NodesFlsRepository extends DefaultCrudRepository<
NodesFls,
  typeof NodesFls.prototype.id,
  NodesFlsRelations
> {
  constructor(
    @inject('datasources.p2p') dataSource: P2PDataSource,
  ) {
    super(NodesFls, dataSource);
  }
}
