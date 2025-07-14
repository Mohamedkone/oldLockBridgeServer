import {Entity, model, property} from '@loopback/repository';

@model()
export class Plan extends Entity {
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
  plan: string;

  @property({
    type: 'string',
    required: true,
  })
  stripeId: string;

  @property({
    type: 'number',
    required: true,
  })
  price: number;
  
  @property({
    type: 'array',
    itemType: 'string',
    required: true,
  })
  feature: string[];


  constructor(data?: Partial<Plan>) {
    super(data);
  }
}

export interface PlanRelations {
  // describe navigational properties here
}

export type PlanWithRelations = Plan & PlanRelations;
