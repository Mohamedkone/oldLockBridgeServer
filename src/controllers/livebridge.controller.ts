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
import {ApiStorage, Livebridge} from '../models';
import {ApiStorageRepository, DefaultStorageRepository, LivebridgeRepository, StorageRepository, UsersRepository} from '../repositories';
import {v4 as uuidv4} from 'uuid';

export class LivebridgeController {
  constructor(
    @repository(LivebridgeRepository)
    public livebridgeRepository : LivebridgeRepository,
    @repository(StorageRepository)
    public storageRepository: StorageRepository,
    @repository(ApiStorageRepository)
    public apiStorageRepository: ApiStorageRepository,
    @repository(UsersRepository)
    public usersRepository: UsersRepository,
    @repository(DefaultStorageRepository)
        public defaultStorageRepository : DefaultStorageRepository,
  ) {}

  @post('/livebridges')
  @response(200, {
    description: 'Livebridge model instance',
    content: {'application/json': {schema: getModelSchemaRef(Livebridge)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Livebridge, {
            title: 'NewLivebridge',
            
          }),
        },
      },
    })
    livebridge: Livebridge,
  ): Promise<Livebridge> {
    const existingBridge= await this.livebridgeRepository.findOne({
            where: {
              alias: livebridge.alias,
            },
    });
    let existingStorage
    if(livebridge.storageType === "api"){

      existingStorage = await this.apiStorageRepository.findOne({
      where: {
        id: livebridge.storageId
      }
    })
    }if(livebridge.storageType === "s3"){
    existingStorage = await this.storageRepository.findOne({
        where: {
          id: livebridge.storageId
        }
      })
    }if(livebridge.storageType === "vault"){
      existingStorage = await this.defaultStorageRepository.findOne({
        where: {
          id: livebridge.storageId
        }
      })
    }

    if(existingStorage){
        if (existingBridge) {
          throw new HttpErrors.Conflict('A record with the same alias already exists.');
        }
        // Generate unique ID and ensure it does not exist in the database
        let uniqueId = uuidv4();
        let uniqueLink = uuidv4();
        let newLink =uniqueLink.replace(/-/g, '').slice(0, 16); // Remove hyphens and trim to 16 characters
        let existingStorageWithId = await this.livebridgeRepository.findById(uniqueId).catch(() => null);
        
        while (existingStorageWithId) {
          uniqueId = uuidv4();
          existingStorageWithId = await this.livebridgeRepository.findById(uniqueId).catch(() => null);
        }
        // Set the generated unique ID and added date
        livebridge.id = uniqueId;
        livebridge.link = newLink;
      return this.livebridgeRepository.create(livebridge);
    }else{
      throw new HttpErrors.NotFound('This storage does not exist')
    }
  }

  @get('/livebridges/count')
  @response(200, {
    description: 'Livebridge model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Livebridge) where?: Where<Livebridge>,
  ): Promise<Count> {
    return this.livebridgeRepository.count(where);
  }

  @get('/livebridges/all/{userId}')
@response(200, {
  description: 'Array of Livebridge model instances',
  content: {
    'application/json': {
      schema: {
        type: 'array',
        items: getModelSchemaRef(Livebridge, {includeRelations: true}),
      },
    },
  },
})
async find(
   @param.path.string('userId') userId: string,
  @param.filter(Livebridge) filter?: Filter<Livebridge>,
): Promise<Livebridge[]> {
  // Merge the user filter with any existing filters
  const userFilter = {
    ...filter,
    where: {
      ...filter?.where,
      ownerId: userId
    }
  };
  
  return this.livebridgeRepository.find(userFilter);
}

  @patch('/livebridges')
  @response(200, {
    description: 'Livebridge PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Livebridge, {partial: true}),
        },
      },
    })
    livebridge: Livebridge,
    @param.where(Livebridge) where?: Where<Livebridge>,
  ): Promise<Count> {
    return this.livebridgeRepository.updateAll(livebridge, where);
  }

  @get('/livebridges/{id}')
  @response(200, {
    description: 'Livebridge model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Livebridge, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Livebridge, {exclude: 'where'}) filter?: FilterExcludingWhere<Livebridge>
  ): Promise<Livebridge> {
    return this.livebridgeRepository.findById(id, filter);
  }
  
  @get('/livebridges/link/{link}')
  @response(200, {
    description: 'Livebridge model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Livebridge, {includeRelations: true}),
      },
    },
  })
  async findOne(
    @param.path.string('link') link: string,
  ): Promise<Object | null> {
    const bridgeLink = await this.livebridgeRepository.findOne({where:{link:link}});
    if(bridgeLink){
      const owner = await this.usersRepository.findById(bridgeLink?.ownerId)
      // const myStorage = await this.storageRepository.findById(bridgeLink?.storageId)
      if(owner){
        return {
          bridge:
            {
              access:bridgeLink.access,
              security:bridgeLink.security,
              storageId:bridgeLink.storageId,
              system: bridgeLink.storageType,
            }, 
          owner: `${owner.fname} ${owner.lname}`,
          
        }
      }
    }
    throw new HttpErrors.NotFound("This bridge does not exist")
  }

  @patch('/livebridges/{id}')
  @response(204, {
    description: 'Livebridge PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Livebridge, {partial: true}),
        },
      },
    })
    livebridge: Livebridge,
  ): Promise<void> {
    await this.livebridgeRepository.updateById(id, livebridge);
  }

  @put('/livebridges/{id}')
  @response(204, {
    description: 'Livebridge PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() livebridge: Livebridge,
  ): Promise<void> {
    await this.livebridgeRepository.replaceById(id, livebridge);
  }

  @del('/livebridges/{id}')
  @response(204, {
    description: 'Livebridge DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.livebridgeRepository.deleteById(id);
  }
}
