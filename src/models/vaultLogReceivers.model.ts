import { model, property} from '@loopback/repository';

@model()
export default class Receivers {
  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'number',
    required: true,
  })
  received: number;

  constructor(data?: Partial<Receivers>) {
    Object.assign(this, data);
  }
}
