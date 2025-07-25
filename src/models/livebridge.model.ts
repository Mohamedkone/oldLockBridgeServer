import {Entity, model, property} from '@loopback/repository';

@model()
export class Livebridge extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: false,
  })
  id: string;

  @property({
    type: 'string',
    required: false,
  })
  ownerId: string;
  
  @property({
    type: 'string',
    required: false,
  })
  link: string;

  @property({
    type: 'string',
    required: true,
  })
  storageId: string;
  
  @property({
    type: 'string',
    required: true,
  })
  storageType: string;

  @property({
    type: 'string',
    required: true,
  })
  alias: string;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {
      format: 'date',
    },
  })
  exp: string;

  @property({
    type: 'number',
    required: true,
  })
  access: number;

  @property({
    type: 'number',
    required: true,
  })
  security: number;
  
  @property({
    type: 'any',
  })
  pass?: string | null;
  
  @property({
    type: 'string',
  })
  encryptionType?: string;
  
  @property({
    type: 'string',
  })
  keyDerivationMethod?: string;
  
  @property({
    type: 'number',
  })
  keyVersion?: number;
  
  @property({
    type: 'boolean',
    required: true,
  })
  status: boolean;


  constructor(data?: Partial<Livebridge>) {
    super(data);
  }
}

export interface LivebridgeRelations {
  // describe navigational properties here
}

export type LivebridgeWithRelations = Livebridge & LivebridgeRelations;
