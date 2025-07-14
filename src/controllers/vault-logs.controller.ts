import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {VaultLogs} from '../models';
import {VaultLogsRepository} from '../repositories';

export class VaultLogsController {
  constructor(
    @repository(VaultLogsRepository)
    public vaultLogsRepository : VaultLogsRepository,
  ) {}

  @post('/vault-logs')
  @response(200, {
    description: 'VaultLogs model instance',
    content: {'application/json': {schema: getModelSchemaRef(VaultLogs)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(VaultLogs, {
            title: 'NewVaultLogs',

          }),
        },
      },
    })
    vaultLogs: VaultLogs,
  ): Promise<VaultLogs> {
    return this.vaultLogsRepository.create(vaultLogs);
  }

  @get('/vault-logs/count')
  @response(200, {
    description: 'VaultLogs model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(VaultLogs) where?: Where<VaultLogs>,
  ): Promise<Count> {
    return this.vaultLogsRepository.count(where);
  }

  @get('/vault-logs')
  @response(200, {
    description: 'Array of VaultLogs model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(VaultLogs, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(VaultLogs) filter?: Filter<VaultLogs>,
  ): Promise<VaultLogs[]> {
    return this.vaultLogsRepository.find(filter);
  }

  @patch('/vault-logs')
  @response(200, {
    description: 'VaultLogs PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(VaultLogs, {partial: true}),
        },
      },
    })
    vaultLogs: VaultLogs,
    @param.where(VaultLogs) where?: Where<VaultLogs>,
  ): Promise<Count> {
    return this.vaultLogsRepository.updateAll(vaultLogs, where);
  }

  @get('/vault-logs/{companyId}')
  @response(200, {
    description: 'Array of Logs model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(VaultLogs, {includeRelations: true}),
        },
      },
    },
  })
  async findByCompanyId(
    @param.path.string('companyId') companyId: string,
    @param.filter(VaultLogs) filter?: Filter<VaultLogs>
  ): Promise<VaultLogs[]> {
    return this.vaultLogsRepository.find({
      where: { companyId: companyId },
      ...filter,
    });
  }

  @patch('/vault-logs/{id}')
  @response(204, {
    description: 'VaultLogs PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(VaultLogs, {partial: true}),
        },
      },
    })
    vaultLogs: VaultLogs,
  ): Promise<void> {
    await this.vaultLogsRepository.updateById(id, vaultLogs);
  }

  @patch('/p-vault-logs/{id}')
@response(204, {
  description: 'VaultLogs PATCH success',
})
async updateR(
  @param.path.string('id') id: string,
  @requestBody({
    content: {
      'application/json': {
        schema: getModelSchemaRef(VaultLogs, {partial: true}),
      },
}})
    vaultLogs: Partial<VaultLogs>,
): Promise<void> {
  // Fetch the existing VaultLogs record
  const existingVaultLog = await this.vaultLogsRepository.findById(id);

  // Update the receivers array
  if (vaultLogs.receivers) {
    for (const newReceiver of vaultLogs.receivers) {
      const existingReceiver = existingVaultLog.receivers.find(receiver => receiver.email === newReceiver.email);

      if (existingReceiver) {
        // Update the received value only if current value is false and new value is true
        if (existingReceiver.received === 0 && newReceiver.received === 1) {
          existingReceiver.received = newReceiver.received;
        }
      } else {
        // Add the new receiver
        existingVaultLog.receivers.push(newReceiver);
      }
    }
  }

  // Save the updated record
  await this.vaultLogsRepository.updateById(id, existingVaultLog);
}


  @put('/vault-logs/{id}')
  @response(204, {
    description: 'VaultLogs PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() vaultLogs: VaultLogs,
  ): Promise<void> {
    await this.vaultLogsRepository.replaceById(id, vaultLogs);
  }

  @del('/vault-logs/{id}')
  @response(204, {
    description: 'VaultLogs DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.vaultLogsRepository.deleteById(id);
  }
}
