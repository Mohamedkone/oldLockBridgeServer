import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {P2PDataSource} from '../datasources';
import {GuestInvite, GuestInviteRelations} from '../models';

export class GuestInviteRepository extends DefaultCrudRepository<
GuestInvite,
  typeof GuestInvite.prototype.id,
  GuestInviteRelations
> {
  constructor(
    @inject('datasources.p2p') dataSource: P2PDataSource,
  ) {
    super(GuestInvite, dataSource);
  }
}
