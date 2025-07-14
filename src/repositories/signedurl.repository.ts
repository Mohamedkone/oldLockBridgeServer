import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {P2PDataSource} from '../datasources';
import {Signedurl, SignedurlRelations} from '../models';

export class SignedurlRepository extends DefaultCrudRepository<
  Signedurl,
  typeof Signedurl.prototype.id,
  SignedurlRelations
> {
  constructor(
    @inject('datasources.p2p') dataSource: P2PDataSource,
  ) {
    super(Signedurl, dataSource);
  }
}
