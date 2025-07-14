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
import {Logs} from '../models';
import {LogsRepository} from '../repositories';

export class LogsController {
  constructor(
    @repository(LogsRepository)
    public logsRepository : LogsRepository,
  ) {}

  @post('/logs')
  @response(200, {
    description: 'Logs model instance',
    content: {'application/json': {schema: getModelSchemaRef(Logs)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Logs, {
            title: 'NewLogs',

          }),
        },
      },
    })
    logs: Logs,
  ): Promise<Logs> {
    // const test = await this.logsRepository.create(logs);
    // console.log(test)
    return this.logsRepository.create(logs);
  }

  @get('/logs/count')
  @response(200, {
    description: 'Logs model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Logs) where?: Where<Logs>,
  ): Promise<Count> {
    return this.logsRepository.count(where);
  }

  @get('/logs')
  @response(200, {
    description: 'Array of Logs model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Logs, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Logs) filter?: Filter<Logs>,
  ): Promise<Logs[]> {
    return this.logsRepository.find(filter);
  }

  @patch('/logs')
  @response(200, {
    description: 'Logs PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Logs, {partial: true}),
        },
      },
    })
    logs: Logs,
    @param.where(Logs) where?: Where<Logs>,
  ): Promise<Count> {
    return this.logsRepository.updateAll(logs, where);
  }

  @get('/logs/{companyId}')
  @response(200, {
    description: 'Array of Logs model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Logs, {includeRelations: true}),
        },
      },
    },
  })
  async findByCompanyId(
    @param.path.string('companyId') companyId: string,
    @param.filter(Logs) filter?: Filter<Logs>
  ): Promise<Logs[]> {
    return this.logsRepository.find({
      where: { companyId: companyId },
      ...filter,
    });
  }

  @patch('/logs/{id}')
  @response(204, {
    description: 'Logs PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Logs, {partial: true}),
        },
      },
    })
    logs: Logs,
  ): Promise<void> {
    await this.logsRepository.updateById(id, logs);
  }

  @put('/logs/{id}')
  @response(204, {
    description: 'Logs PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() logs: Logs,
  ): Promise<void> {
    await this.logsRepository.replaceById(id, logs);
  }

  @del('/logs/{id}')
  @response(204, {
    description: 'Logs DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.logsRepository.deleteById(id);
  }
}
