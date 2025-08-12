import {Entity, model, property} from '@loopback/repository';

@model()
export class Company extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    // required: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;
 
  @property({
    type: 'boolean',
    required: true,
    default: true,
  })
  isPersonal: boolean;

  @property({
    type: 'date',
  })
  addedDate: string;

  @property({
    type: 'string',
  })
  plan?: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'boolean',
    required: true,
  })
  isActive: boolean;

  @property({
    type: 'date',
  })
  firstActiveDate?: string;

  @property({
    type: 'date',
  })
  expirationDate?: string;

  @property({
    type: 'date',
  })
  renewedOn?: string;

  @property({
    type: 'date',
  })
  canceledOn?: string;


  constructor(data?: Partial<Company>) {
    super(data);
  }
}

export interface CompanyRelations {
  // describe navigational properties here
}

export type CompanyWithRelations = Company & CompanyRelations;
