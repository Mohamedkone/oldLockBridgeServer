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
import {Rooms} from '../models';
import {RoomsRepository} from '../repositories';
import { NodesFlsController } from './nodes-fls.controller';
import {inject} from '@loopback/core';

export class RoomsController {
  constructor(
    @inject('controllers.NodesFlsController')
    private nodesFlsCont: NodesFlsController,
    @repository(RoomsRepository)
    public roomsRepository : RoomsRepository,
  ) {}

  @post('/rooms')
  @response(200, {
    description: 'Rooms model instance',
    content: {'application/json': {schema: getModelSchemaRef(Rooms)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Rooms, {
            title: 'NewRooms',

          }),
        },
      },
    })
    rooms: Rooms,
  ): Promise<Rooms> {
    return this.roomsRepository.create(rooms);
  }

  @get('/rooms/count')
  @response(200, {
    description: 'Rooms model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Rooms) where?: Where<Rooms>,
  ): Promise<Count> {
    return this.roomsRepository.count(where);
  }

  @get('/rooms')
  @response(200, {
    description: 'Array of Rooms model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Rooms, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Rooms) filter?: Filter<Rooms>,
  ): Promise<Rooms[]> {
    return this.roomsRepository.find(filter);
  }

  @patch('/rooms')
  @response(200, {
    description: 'Rooms PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Rooms, {partial: true}),
        },
      },
    })
    rooms: Rooms,
    @param.where(Rooms) where?: Where<Rooms>,
  ): Promise<Count> {
    return this.roomsRepository.updateAll(rooms, where);
  }

  @get('/rooms/{admin}')
  @response(200, {
    description: 'Rooms model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Rooms, {includeRelations: true}),
      },
    },
  })
  async findOne(
    @param.path.string('admin') admin: string,
  ): Promise<Rooms[]> {
    return this.roomsRepository.find({where:{admin}});
  }

  @get('/rooms/i/{id}')
  @response(200, {
    description: 'Rooms model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Rooms, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Rooms, {exclude: 'where'}) filter?: FilterExcludingWhere<Rooms>
  ): Promise<Rooms> {
    return this.roomsRepository.findById(id, filter);
  }

  @patch('/rooms/{id}')
  @response(204, {
    description: 'Rooms PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Rooms, {partial: true}),
        },
      },
    })
    rooms: Rooms,
  ): Promise<void> {
    await this.roomsRepository.updateById(id, rooms);
  }

  @put('/rooms/{id}')
  @response(204, {
    description: 'Rooms PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() rooms: Rooms,
  ): Promise<void> {
    await this.roomsRepository.replaceById(id, rooms);
  }

  @del('/rooms/{id}')
  @response(204, {
    description: 'Rooms DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    try{
      await this.roomsRepository.deleteById(id);
      await this.nodesFlsCont.deleteByRoomId(id)
    }
    catch(err){
      console.log(err)
    }
  }
}
