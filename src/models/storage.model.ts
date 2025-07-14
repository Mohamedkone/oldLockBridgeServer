import {Entity, model, property} from '@loopback/repository';

export interface S3Access {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region: string;
}

@model()
export class Storage extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  alias: string;

  @property({
    type: 'string',
    required: true,
  })
  system: string;

  @property({
    type: 'string',
    required: true,
  })
  ownerId: string;

  @property({
    type: 'object',
    required: true,
    jsonSchema:{
      type: 'object',
      properties:{
        endpoint: {type: 'string'},
        accessKeyId: {type: 'string'},
        secretAccessKey: {type: 'string'},
        bucketName: {type: 'string'},
        region: {type: 'string'},
      },
      required: ['endpoint', 'accessKeyId', 'secretAccessKey', 'bucketName', 'region'],
    }
  })
  access: S3Access;


  constructor(data?: Partial<Storage>) {
    super(data);
  }
}

export interface StorageRelations {
  // describe navigational properties here
}

export type StorageWithRelations = Storage & StorageRelations;
