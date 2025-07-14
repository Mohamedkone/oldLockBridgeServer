import {Entity, model, property} from '@loopback/repository';

@model()
export class Finder extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
  })
  id?: string;
  
  @property({
    type: 'string',
    required: true
  })
  ownerId: string;
  
  @property({
    type: 'object',
    required: true
  })
  json: object;


  constructor(data?: Partial<Finder>) {
    super(data);
  }
}

export interface FinderRelations {
  // describe navigational properties here
}

export type FinderWithRelations = Finder & FinderRelations;
