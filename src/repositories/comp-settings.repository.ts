import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {P2PDataSource} from '../datasources';
import {CompSettings, CompSettingsRelations} from '../models';

export class CompSettingsRepository extends DefaultCrudRepository<
CompSettings,
  typeof CompSettings.prototype.id,
  CompSettingsRelations
> {
  constructor(
    @inject('datasources.p2p') dataSource: P2PDataSource,
  ) {
    super(CompSettings, dataSource);
  }
}
