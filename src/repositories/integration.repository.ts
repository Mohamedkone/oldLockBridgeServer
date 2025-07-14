import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {P2PDataSource} from '../datasources';
import {Integration, IntegrationRelations} from '../models';

export class IntegrationRepository extends DefaultCrudRepository<
  Integration,
  typeof Integration.prototype.id,
  IntegrationRelations
> {
  constructor(
    @inject('datasources.p2p') dataSource: P2PDataSource,
  ) {
    super(Integration, dataSource);
  }
}
