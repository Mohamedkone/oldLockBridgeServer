import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
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
import {CompSettings} from '../models';
import {CompSettingsRepository} from '../repositories';

export class CompSettingsController {
  constructor(
    @repository(CompSettingsRepository)
    public compSettingsRepository : CompSettingsRepository,
  ) {}

  @post('/comp-settings')
  @response(200, {
    description: 'CompSettings model instance',
    content: {'application/json': {schema: getModelSchemaRef(CompSettings)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CompSettings, {
            title: 'NewCompSettings',
            
          }),
        },
      },
    })
    compSettings: CompSettings,
  ): Promise<CompSettings> {
    return this.compSettingsRepository.create(compSettings);
  }

  @get('/comp-settings/count')
  @response(200, {
    description: 'CompSettings model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(CompSettings) where?: Where<CompSettings>,
  ): Promise<Count> {
    return this.compSettingsRepository.count(where);
  }

  @get('/comp-settings')
  @response(200, {
    description: 'Array of CompSettings model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(CompSettings, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(CompSettings) filter?: Filter<CompSettings>,
  ): Promise<CompSettings[]> {
    return this.compSettingsRepository.find(filter);
  }

  @patch('/comp-settings')
  @response(200, {
    description: 'CompSettings PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CompSettings, {partial: true}),
        },
      },
    })
    compSettings: CompSettings,
    @param.where(CompSettings) where?: Where<CompSettings>,
  ): Promise<Count> {
    return this.compSettingsRepository.updateAll(compSettings, where);
  }

  @get('/comp-settings/{id}')
  @response(200, {
    description: 'CompSettings model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(CompSettings, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(CompSettings, {exclude: 'where'}) filter?: FilterExcludingWhere<CompSettings>
  ): Promise<CompSettings> {
    return this.compSettingsRepository.findById(id, filter);
  }

  @patch('/comp-settings/{id}')
  @response(204, {
    description: 'CompSettings PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CompSettings, {partial: true}),
        },
      },
    })
    compSettings: CompSettings,
  ): Promise<void> {
    await this.compSettingsRepository.updateById(id, compSettings);
  }

  @put('/comp-settings/{id}')
  @response(204, {
    description: 'CompSettings PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() compSettings: CompSettings,
  ): Promise<void> {
    await this.compSettingsRepository.replaceById(id, compSettings);
  }

  @del('/comp-settings/{id}')
  @response(204, {
    description: 'CompSettings DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.compSettingsRepository.deleteById(id);
  }
}
