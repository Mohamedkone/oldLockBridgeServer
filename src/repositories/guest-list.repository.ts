import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {P2PDataSource} from '../datasources';
import {GuestList, GuestListRelations} from '../models';

export class GuestListRepository extends DefaultCrudRepository<
GuestList,
  typeof GuestList.prototype.id,
  GuestListRelations
> {
  constructor(
    @inject('datasources.p2p') dataSource: P2PDataSource,
  ) {
    super(GuestList, dataSource);
  }
}
