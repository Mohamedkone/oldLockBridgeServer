import {Entity, model, property} from '@loopback/repository';

@model()
export class GuestList extends Entity {
  @property({
    type: 'string',
    required: true,
  })
  companyId: string;

  @property({
    type: 'string',
    required: true,
  })
  guestId: string;

  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;


  constructor(data?: Partial<GuestList>) {
    super(data);
  }
}

export interface GuestListRelations {
  // describe navigational properties here
}

export type GuestListWithRelations = GuestList & GuestListRelations;
