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
import {Storage, Users} from '../models';
import {StorageRepository} from '../repositories';
import {v4 as uuidv4} from 'uuid';
import { HttpStatusCode } from 'axios';

export class StorageController {
  constructor(
    @repository(StorageRepository)
    public storageRepository : StorageRepository,
  ) {}

  @post('/storages')
  @response(200, {
    description: 'Storage model instance',
    content: {'application/json': {schema: getModelSchemaRef(Storage)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Storage, {
            title: 'NewStorage',
            
          }),
        },
      },
    })
    storage: Storage,
  ): Promise<Storage> {
    const existingStorage = await this.storageRepository.findOne({
        where: {
          ownerId: storage.ownerId,
          alias: storage.alias,
        },
    });
    if (existingStorage) {
      throw new HttpErrors.Conflict('A record with the same alias already exists.');
    }
    // Generate unique ID and ensure it does not exist in the database
    let uniqueId = uuidv4();
    let existingStorageWithId = await this.storageRepository.findById(uniqueId).catch(() => null);

    while (existingStorageWithId) {
      uniqueId = uuidv4();
      existingStorageWithId = await this.storageRepository.findById(uniqueId).catch(() => null);
    }
    // Set the generated unique ID and added date
    storage.id = uniqueId;
    return this.storageRepository.create(storage);
  }

  @get('/storages/count')
  @response(200, {
    description: 'Storage model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Storage) where?: Where<Storage>,
  ): Promise<Count> {
    return this.storageRepository.count(where);
  }

  @get('/storages')
  @response(200, {
    description: 'Array of Storage model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Storage, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Storage) filter?: Filter<Storage>,
  ): Promise<Storage[]> {
    return this.storageRepository.find(filter);
  }

  @patch('/storages')
  @response(200, {
    description: 'Storage PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Storage, {partial: true}),
        },
      },
    })
    storage: Storage,
    @param.where(Storage) where?: Where<Storage>,
  ): Promise<Count> {
    return this.storageRepository.updateAll(storage, where);
  }

  @get('/storages/{id}')
  @response(200, {
    description: 'Storage model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Storage, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Storage, {exclude: 'where'}) filter?: FilterExcludingWhere<Storage>
  ): Promise<Storage> {
    return this.storageRepository.findById(id, filter);
  }
  
  @get('/mystorages/{id}')
  @response(200, {
    description: 'Storage model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Storage, {includeRelations: true}),
      },
    },
  })
  async findMyStorage(
    @param.path.string('id') id: string,
  ): Promise<Object[]> {
    const newRes = []
    const res = await this.storageRepository.find({where:{ownerId:id}});
    for(let x of res){
      newRes.push({id: x.id, alias: x.alias, platform: x.system })
    }
    return newRes
  }

  @patch('/storages/{id}')
  @response(204, {
    description: 'Storage PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Storage, {partial: true}),
        },
      },
    })
    storage: Storage,
  ): Promise<void> {
    await this.storageRepository.updateById(id, storage);
  }

  @put('/storages/{id}')
  @response(204, {
    description: 'Storage PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() storage: Storage,
  ): Promise<void> {
    await this.storageRepository.replaceById(id, storage);
  }

  @del('/storages/{id}')
  @response(204, {
    description: 'Storage DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.storageRepository.deleteById(id);
  }
  @del('/storages')
  @response(204, {
    description: 'Storage DELETE success',
  })
  async delete(
    @requestBody({
      description: 'Array of data sent from the client',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'string', // Change to 'type: object' or other types based on your array's data structure
            },
          },
        },
      },
    })
    arrayData: string[],
  ): Promise<object> {
    const notRemoved: string[] = [];

    for (const id of arrayData) {
      try {
        await this.storageRepository.deleteById(id);
      } catch (err) {
        notRemoved.push(id);
      }
    }

    if (notRemoved.length >= 1) {
      return {
        status: 404,
        message: 'Some items could not be found',
        notRemoved,
      };
    }

    return {
      status: 200, // HTTP OK
      message: 'All items deleted successfully',
    };
  }
}
