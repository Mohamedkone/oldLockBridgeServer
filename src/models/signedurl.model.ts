import {Entity, model, property} from '@loopback/repository';

@model()
export class Signedurl extends Entity {
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
  BridgeId: string;

  @property({
    type: 'string',
    required: true,
  })
  url: string;


  constructor(data?: Partial<Signedurl>) {
    super(data);
  }
}

export interface SignedurlRelations {
  // describe navigational properties here
}

export type SignedurlWithRelations = Signedurl & SignedurlRelations;
