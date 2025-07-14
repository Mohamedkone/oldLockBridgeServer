import {Entity, model, property} from '@loopback/repository';
import Receivers from './vaultLogReceivers.model';

@model()
export class VaultLogs extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  logId: string;

  @property({
    type: 'string',
    required: true,
  })
  senderEmail: string;

  @property({
    type: 'string',
    required: true,
  })
  fileName: string;

  @property({
    type: 'number',
    required: true,
  })
  size: number;

  @property({
    type: 'string',
    required: true,
  })
  type: string;

  @property({
    type: 'string',
    required: true,
  })
  date: string;

  @property({
    type: 'boolean',
    // required: true,
  })
  received: boolean;

  @property({
    type: 'array',
    itemType: "object",

    // required: true,
  })
  receivers: Receivers[];

  @property({
    type: 'string',
    required: true,
  })
  companyId: string;


  constructor(data?: Partial<VaultLogs>) {
    super(data);
  }
}

export interface VaultLogsRelations {
  // describe navigational properties here
}

export type VaultLogsWithRelations = VaultLogs & VaultLogsRelations;
