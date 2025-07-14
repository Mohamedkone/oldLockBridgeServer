import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {P2PDataSource} from '../datasources';
import {Guests, GuestsRelations} from '../models';

export class GuestsRepository extends DefaultCrudRepository<
  Guests,
  typeof Guests.prototype.id,
  GuestsRelations
> {
  constructor(
    @inject('datasources.p2p') dataSource: P2PDataSource,
  ) {
    super(Guests, dataSource);
  }
}
