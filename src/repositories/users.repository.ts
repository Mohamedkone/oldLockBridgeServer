import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {P2PDataSource} from '../datasources';
import {Users, UsersRelations} from '../models';

export class UsersRepository extends DefaultCrudRepository<
  Users,
  typeof Users.prototype.id,
  UsersRelations
> {
  constructor(
    @inject('datasources.p2p') dataSource: P2PDataSource,
  ) {
    super(Users, dataSource);
  }
}
