import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {P2PDataSource} from '../datasources';
import {RoomInvite, RoomInviteRelations} from '../models';

export class RoomInviteRepository extends DefaultCrudRepository<
RoomInvite,
  typeof RoomInvite.prototype.id,
  RoomInviteRelations
> {
  constructor(
    @inject('datasources.p2p') dataSource: P2PDataSource,
  ) {
    super(RoomInvite, dataSource);
  }
}
