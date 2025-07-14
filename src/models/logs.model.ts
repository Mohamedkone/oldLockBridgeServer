import {Entity, model, property} from '@loopback/repository';

@model()
export class Logs extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  logId: string;

  @property({
    type: 'string',
    required: true,
  })
  senderEmail: string;

  @property({
    type: 'string',
    required: true,
  })
  fileName: string;

  @property({
    type: 'number',
    required: true,
  })
  size: number;

  @property({
    type: 'string',
    required: true,
  })
  type: string;

  @property({
    type: 'string',
    required: true,
  })
  date: string;

  @property({
    type: 'boolean',
    // required: true,
  })
  received: boolean;

  @property({
    type: 'string',
    required: true,
  })
  receiver: string;

  @property({
    type: 'string',
    required: true,
  })
  companyId: string;


  constructor(data?: Partial<Logs>) {
    super(data);
  }
}

export interface LogsRelations {
  // describe navigational properties here
}

export type LogsWithRelations = Logs & LogsRelations;
