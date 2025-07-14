import {model, property} from '@loopback/repository';
import {RoomInvite} from '.';

@model()
export class GuestInvite extends RoomInvite {
  @property({
    type: 'string',
    required: true,
  })
  companyId: string;


  constructor(data?: Partial<GuestInvite>) {
    super(data);
  }
}

export interface GuestInviteRelations {
  // describe navigational properties here
}

export type GuestInviteWithRelations = GuestInvite & GuestInviteRelations;
