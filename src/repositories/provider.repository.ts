import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {P2PDataSource} from '../datasources';
import {Provider, ProviderRelations} from '../models';

export class ProviderRepository extends DefaultCrudRepository<
  Provider,
  typeof Provider.prototype.id,
  ProviderRelations
> {
  constructor(
    @inject('datasources.p2p') dataSource: P2PDataSource,
  ) {
    super(Provider, dataSource);
  }
}
