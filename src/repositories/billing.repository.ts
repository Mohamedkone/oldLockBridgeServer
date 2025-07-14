import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {P2PDataSource} from '../datasources';
import {Billing, BillingRelations} from '../models';

export class BillingRepository extends DefaultCrudRepository<
  Billing,
  typeof Billing.prototype.id,
  BillingRelations
> {
  constructor(
    @inject('datasources.p2p') dataSource: P2PDataSource,
  ) {
    super(Billing, dataSource);
  }
}
