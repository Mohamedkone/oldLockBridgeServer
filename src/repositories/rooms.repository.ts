import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {P2PDataSource} from '../datasources';
import {Rooms, RoomsRelations} from '../models';

export class RoomsRepository extends DefaultCrudRepository<
  Rooms,
  typeof Rooms.prototype.id,
  RoomsRelations
> {
  constructor(
    @inject('datasources.p2p') dataSource: P2PDataSource,
  ) {
    super(Rooms, dataSource);
  }
}
