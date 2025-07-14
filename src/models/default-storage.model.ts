import {Entity, model, property} from '@loopback/repository';
import { S3Access } from './storage.model';

@model()
export class DefaultStorage extends Entity {
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
  providerId?: string;

  @property({
    type: 'string',
    required: true,
  })
  ownerId: string;

  @property({
    type: 'number',
    required: true,
    mysql:{
      dataType: 'BIGINT',
    }
  })
  size: number;

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

  @property({
    type: 'object',
    required: true,
  })
  stats: object;


  constructor(data?: Partial<DefaultStorage>) {
    super(data);
  }
}

export interface DefaultStorageRelations {
  // describe navigational properties here
}

export type DefaultStorageWithRelations = DefaultStorage & DefaultStorageRelations;
