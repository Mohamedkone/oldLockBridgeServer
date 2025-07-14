import {Entity, model, property} from '@loopback/repository';

@model()
export class Directbridge extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  ownerId: string;

  @property({
    type: 'string',
    required: true,
  })
  target: string;
  
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
  security: number;
  
  @property({
    type: 'string',
    required: false,
  })
  link: string;
  
  @property({
    type: 'boolean',
    required: true,
  })
  status: boolean;


  constructor(data?: Partial<Directbridge>) {
    super(data);
  }
}

export interface DirectbridgeRelations {
  // describe navigational properties here
}

export type DirectbridgeWithRelations = Directbridge & DirectbridgeRelations;
