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
import {Directbridge} from '../models';
import {ApiStorageRepository, DirectbridgeRepository, StorageRepository} from '../repositories';
import {v4 as uuidv4} from 'uuid';


export class DirectbridgeController {
  constructor(
    @repository(DirectbridgeRepository)
    public directbridgeRepository : DirectbridgeRepository,
    @repository(StorageRepository)
    public storageRepository: StorageRepository,
    @repository(ApiStorageRepository)
    public apiStorageRepository: ApiStorageRepository,
  ) {}

  @post('/directbridges')
  @response(200, {
    description: 'Directbridge model instance',
    content: {'application/json': {schema: getModelSchemaRef(Directbridge)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Directbridge, {
            title: 'NewDirectbridge',
          }),
        },
      },
    })
    directbridge: Directbridge,
  ): Promise<Directbridge> {
    const existingBridge= await this.directbridgeRepository.findOne({
                where: {
                  ownerId: directbridge.ownerId,
                  target: directbridge.target,
                },
        });
        let existingStorage
    if(directbridge.storageType === "api"){

      existingStorage = await this.apiStorageRepository.findOne({
      where: {
        id: directbridge.storageId
      }
    })
    }else{

    existingStorage = await this.storageRepository.findOne({
        where: {
          id: directbridge.storageId
        }
      })
    }
        if(existingStorage){
            if (existingBridge) {
              throw new HttpErrors.Conflict('A record with the same target already exists.');
            }
            // Generate unique ID and ensure it does not exist in the database
            let uniqueId = uuidv4();
            let uniqueLink = uuidv4();
            let newLink =uniqueLink.replace(/-/g, '').slice(0, 16); // Remove hyphens and trim to 16 characters
            let existingStorageWithId = await this.directbridgeRepository.findById(uniqueId).catch(() => null);
            
            while (existingStorageWithId) {
              uniqueId = uuidv4();
              existingStorageWithId = await this.directbridgeRepository.findById(uniqueId).catch(() => null);
            }
            // Set the generated unique ID and added date
            directbridge.id = uniqueId;
            directbridge.link = newLink;
          return this.directbridgeRepository.create(directbridge);
        }else{
          throw new HttpErrors.NotFound('This storage does not exist')
        }
  }

  @get('/directbridges/count')
  @response(200, {
    description: 'Directbridge model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Directbridge) where?: Where<Directbridge>,
  ): Promise<Count> {
    return this.directbridgeRepository.count(where);
  }

  @get('/directbridges')
  @response(200, {
    description: 'Array of Directbridge model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Directbridge, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Directbridge) filter?: Filter<Directbridge>,
  ): Promise<Directbridge[]> {
    return this.directbridgeRepository.find(filter);
  }

  @patch('/directbridges')
  @response(200, {
    description: 'Directbridge PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Directbridge, {partial: true}),
        },
      },
    })
    directbridge: Directbridge,
    @param.where(Directbridge) where?: Where<Directbridge>,
  ): Promise<Count> {
    return this.directbridgeRepository.updateAll(directbridge, where);
  }

  @get('/directbridges/{id}')
  @response(200, {
    description: 'Directbridge model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Directbridge, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Directbridge, {exclude: 'where'}) filter?: FilterExcludingWhere<Directbridge>
  ): Promise<Directbridge> {
    return this.directbridgeRepository.findById(id, filter);
  }

  @patch('/directbridges/{id}')
  @response(204, {
    description: 'Directbridge PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Directbridge, {partial: true}),
        },
      },
    })
    directbridge: Directbridge,
  ): Promise<void> {
    await this.directbridgeRepository.updateById(id, directbridge);
  }

  @put('/directbridges/{id}')
  @response(204, {
    description: 'Directbridge PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() directbridge: Directbridge,
  ): Promise<void> {
    await this.directbridgeRepository.replaceById(id, directbridge);
  }

  @del('/directbridges/{id}')
  @response(204, {
    description: 'Directbridge DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.directbridgeRepository.deleteById(id);
  }
}
