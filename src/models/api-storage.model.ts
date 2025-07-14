import {Entity, model, property} from '@loopback/repository';

@model()
export class ApiStorage extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
  })
  id: string;

  @property({
    type: 'string',
  })
  alias: string;
  
  @property({
    type: 'string',
  })
  system: string;

  @property({
    type: 'string',
  })
  ownerId: string;

  @property({
    type: 'string',
  })
  refreshToken: string;
  // @property({
  //   type: 'string',
  // })
  // userId: string;

  // @property({
  //   type: 'string',
  // })
  // code: string;

  // @property({
  //   type: 'string',
  // })
  // redirectUri: string;


  constructor(data?: Partial<ApiStorage>) {
    super(data);
  }
}

export interface ApiStorageRelations {
  // describe navigational properties here
}

export type ApiStorageWithRelations = ApiStorage & ApiStorageRelations;
