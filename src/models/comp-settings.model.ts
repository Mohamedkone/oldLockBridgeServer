import {Entity, model, property} from '@loopback/repository';

@model()
export class CompSettings extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  id: string;

  @property({
    type: 'boolean',
    required: true,
  })
  trackDownloads: boolean;

  @property({
    type: 'object',
    required: true,
    jsonSchema: {
      type: 'object',
      required: ['fileSizeLimit', 'userLimit'],
      properties: {
        fileSizeLimit: {
          type: 'number',
          default: 2000,
        },
        userLimit: {
          type: 'number',
          default: 5
        },
      },
    },
  })
  p2proom: object;

  @property({
    type: 'object',
    required: true,
    jsonSchema: {
      type: 'object',
      required: ['fileSizeLimit', 'encryptFiles', 'userLimit'],
      properties: {
        fileSizeLimit: {
          type: 'number',
          default: 1000,
        },
        encryptFiles: {
          type: 'number',
          default: true,
        },
        userLimit: {
          type: 'number',
          default: true,
        },
      },
    },
  })
  datavaultroom: object;

  @property({
    type: 'number',
    required: true,
  })
  roomAccess: number;

  @property({
    type: 'number',
    required: true,
  })
  roomActions: number;

  @property({
    type: 'number',
    required: true,
  })
  roomLimit: number;


  constructor(data?: Partial<CompSettings>) {
    super(data);
  }
}

export interface CompSettingsRelations {
  // describe navigational properties here
}

export type CompSettingsWithRelations = CompSettings & CompSettingsRelations;
