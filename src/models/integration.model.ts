import {Entity, model, property} from '@loopback/repository';

@model()
export class Integration extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  host: string;

  @property({
    type: 'object',
    required: true,
  })
  script: object;

  @property({
    type: 'date',
    required: true,
    jsonSchema:{
      format: 'date'
    },
    mysql: {
      dataType: 'DATE',
  },
  })
  addedDate: string;

  @property({
    type: 'string',
    required: true,
  })
  ownerId: string;

  @property({
    type: 'boolean',
    required: false,
  })
  status: boolean


  constructor(data?: Partial<Integration>) {
    super(data);
  }
}

export interface IntegrationRelations {
  // describe navigational properties here
}

export type IntegrationWithRelations = Integration & IntegrationRelations;
