import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {P2PDataSource} from '../datasources';
import {Finder, FinderRelations} from '../models';

export class FinderRepository extends DefaultCrudRepository<
  Finder,
  typeof Finder.prototype.id,
  FinderRelations
> {
  constructor(
    @inject('datasources.p2p') dataSource: P2PDataSource
  ) {
    super(Finder, dataSource);
  }
}
