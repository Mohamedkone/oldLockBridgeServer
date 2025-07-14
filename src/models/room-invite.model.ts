import {Entity, model, property} from '@loopback/repository';

@model()
export class RoomInvite extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  key: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  userId: string;

  @property({
    type: 'string',
    required: true,
  })
  type: string;


  constructor(data?: Partial<RoomInvite>) {
    super(data);
  }
}

export interface RoomInviteRelations {
  // describe navigational properties here
}

export type RoomInviteWithRelations = RoomInvite & RoomInviteRelations;
