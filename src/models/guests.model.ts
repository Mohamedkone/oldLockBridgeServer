import {Entity, model, property} from '@loopback/repository';

@model()
export class Guests extends Entity {
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
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  company: string;

  @property({
    type: 'string',
    required: true,
  })
  fname: string;

  @property({
    type: 'string',
    required: true,
  })
  lname: string;

  @property({
    type: 'date',
  })
  addedDate: string;

  @property({
    type: 'date',
  })
  deleteOn: string;


  constructor(data?: Partial<Guests>) {
    super(data);
  }
}

export interface GuestsRelations {
  // describe navigational properties here
}

export type GuestsWithRelations = Guests & GuestsRelations;
