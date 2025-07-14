import {Entity, model, property} from '@loopback/repository';

export enum VaultDataType {
  FILE = 'file',
  FOLDER = 'folder',
}

@model()
export class VaultData extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  ownerId: string;

  @property({
    type: 'string',
  })
  key: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'number',
    required: true,
  })
  size: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(VaultDataType),
    }
  })
  type: string;

  @property({
    type: 'string',
  })
  parentId: string;

  @property({
    type: 'date',
    defaultFn: 'now',
  })
  createdAt: string;


  constructor(data?: Partial<VaultData>) {
    super(data);
  }
}

export interface VaultDataRelations {
  // describe navigational properties here
}

export type VaultDataWithRelations = VaultData & VaultDataRelations;
