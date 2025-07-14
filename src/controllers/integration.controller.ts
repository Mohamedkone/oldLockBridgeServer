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
  HttpErrors,
} from '@loopback/rest';
import {Integration} from '../models';
import {IntegrationRepository} from '../repositories';
import { v4 as uuidv4 } from 'uuid';

export class IntegrationController {
  constructor(
    @repository(IntegrationRepository)
    public integrationRepository : IntegrationRepository,
  ) {}

  @post('/integrations')
  @response(200, {
    description: 'Integration model instance',
    content: {'application/json': {schema: getModelSchemaRef(Integration)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Integration, {
            title: 'NewIntegration',
            
          }),
        },
      },
    })
    integration: Integration,
  ): Promise<Integration> {
    const existingBridge = await this.integrationRepository.findOne({
      where:{
        host: integration.host
      }
    })
    if(existingBridge){
      throw new HttpErrors.Conflict("The website already has a script registeredin our system")
    }
    let newId = uuidv4()
    let existingid = await this.integrationRepository.findById(newId).catch(()=>null)
    while(existingid){
      newId = uuidv4()
      existingid = await this.integrationRepository.findById(newId).catch(()=>null)
    }
    if(existingid){
      throw new HttpErrors.Conflict("try again")
    }else{
      integration.id = newId
      return this.integrationRepository.create(integration);
    }

  }

  @get('/integrations/count')
  @response(200, {
    description: 'Integration model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Integration) where?: Where<Integration>,
  ): Promise<Count> {
    return this.integrationRepository.count(where);
  }

  @get('/integrations')
  @response(200, {
    description: 'Array of Integration model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Integration, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Integration) filter?: Filter<Integration>,
  ): Promise<Integration[]> {
    return this.integrationRepository.find(filter);
  }

  @patch('/integrations')
  @response(200, {
    description: 'Integration PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Integration, {partial: true}),
        },
      },
    })
    integration: Integration,
    @param.where(Integration) where?: Where<Integration>,
  ): Promise<Count> {
    return this.integrationRepository.updateAll(integration, where);
  }

  @get('/integrations/{id}')
  @response(200, {
    description: 'Integration model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Integration, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Integration, {exclude: 'where'}) filter?: FilterExcludingWhere<Integration>
  ): Promise<Object[]> {
    const res = await this.integrationRepository.find({where:{ownerId:id}});
    // console.log(res)
    const newArr = []
    for (let x of res){
      newArr.push({host:x.host,status:x.status})
    }
    return newArr
  }

  @patch('/integrations/{id}')
  @response(204, {
    description: 'Integration PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Integration, {partial: true}),
        },
      },
    })
    integration: Integration,
  ): Promise<void> {
    await this.integrationRepository.updateById(id, integration);
  }

  @put('/integrations/{id}')
  @response(204, {
    description: 'Integration PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() integration: Integration,
  ): Promise<void> {
    await this.integrationRepository.replaceById(id, integration);
  }

  @del('/integrations/{id}')
  @response(204, {
    description: 'Integration DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.integrationRepository.deleteById(id);
  }
}
