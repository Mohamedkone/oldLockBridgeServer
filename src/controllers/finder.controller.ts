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
import {Finder} from '../models';
import {FinderRepository} from '../repositories';

export class FinderController {
  constructor(
    @repository(FinderRepository)
    public finderRepository : FinderRepository,
  ) {}

  @post('/finders')
  @response(200, {
    description: 'Finder model instance',
    content: {'application/json': {schema: getModelSchemaRef(Finder)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Finder, {
            title: 'NewFinder',
            
          }),
        },
      },
    })
    finder: Finder,
  ): Promise<Finder> {
    return this.finderRepository.create(finder);
  }

  @get('/finders/count')
  @response(200, {
    description: 'Finder model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Finder) where?: Where<Finder>,
  ): Promise<Count> {
    return this.finderRepository.count(where);
  }

  @get('/finders')
  @response(200, {
    description: 'Array of Finder model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Finder, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Finder) filter?: Filter<Finder>,
  ): Promise<Finder[]> {
    return this.finderRepository.find(filter);
  }

  @patch('/finders')
  @response(200, {
    description: 'Finder PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Finder, {partial: true}),
        },
      },
    })
    finder: Finder,
    @param.where(Finder) where?: Where<Finder>,
  ): Promise<Count> {
    return this.finderRepository.updateAll(finder, where);
  }

  @get('/finders/{id}')
  @response(200, {
    description: 'Finder model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Finder, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Finder, {exclude: 'where'}) filter?: FilterExcludingWhere<Finder>
  ): Promise<Finder> {
    return this.finderRepository.findById(id, filter);
  }

  @patch('/finders/{id}')
  @response(204, {
    description: 'Finder PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Finder, {partial: true}),
        },
      },
    })
    finder: Finder,
  ): Promise<void> {
    await this.finderRepository.updateById(id, finder);
  }

  @put('/finders/{id}')
  @response(204, {
    description: 'Finder PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() finder: Finder,
  ): Promise<void> {
    await this.finderRepository.replaceById(id, finder);
  }

  @del('/finders/{id}')
  @response(204, {
    description: 'Finder DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.finderRepository.deleteById(id);
  }
}
