import {Entity, model, property} from '@loopback/repository';

@model()
export class Rooms extends Entity {
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
  admin: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    uLimit: 'number',
    required: true,
  })
  uLimit: number;

  @property({
    roomAccess: 'number',
    required: true,
  })
  roomAccess: number;

  @property({
    roomActions: 'number',
    required: true,
  })
  roomActions: number;

  @property({
    type: 'string',
    required: true,
  })
  type: string;

  @property({
    locked: 'boolean',
    required: true,
  })
  locked: boolean;

  @property({
    sizeLimit: 'number',
    required: true,
  })
  sizeLimit: number;

  @property({
    fileStoringLength: 'number',
    required: true,
    mysql:{
      dataType: 'int',
      default: 5
    }
  })
  fileStoringLength: number;


  constructor(data?: Partial<Rooms>) {
    super(data);
  }
}

export interface RoomsRelations {
  // describe navigational properties here
}

export type RoomsWithRelations = Rooms & RoomsRelations;
