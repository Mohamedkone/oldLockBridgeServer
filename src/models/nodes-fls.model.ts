import {Entity, model, property} from '@loopback/repository';

@model()
export class NodesFls extends Entity {
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
  roomId: string;

  @property({
    type: 'string',
    required: true,
  })
  from: string;

  @property({
    type: 'string',
    required: true,
  })
  filename: string;

  @property({
    type: 'date',
    required: true,
  })
  deleteOn: string;

  @property({
    type: 'object',
    required: true,
  })
  metadata: object;

  @property({
    type: 'string',
    required: true,
  })
  nodeId: string;


  constructor(data?: Partial<NodesFls>) {
    super(data);
  }
}

export interface NodesFlsRelations {
  // describe navigational properties here
}

export type NodesFlsWithRelations = NodesFls & NodesFlsRelations;
