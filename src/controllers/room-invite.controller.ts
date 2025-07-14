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
import {RoomInvite} from '../models';
import {RoomInviteRepository} from '../repositories';
import { HttpErrors } from '@loopback/rest';
import {inject} from '@loopback/core';
import {RoomsController} from './rooms.controller';

export class RoomInviteController {
  constructor(
    @inject('controllers.RoomsController')
    private roomController : RoomsController,
    @repository(RoomInviteRepository)
    public roomInviteRepository : RoomInviteRepository,
  ) {}

  @post('/room-invites')
  @response(200, {
    description: 'RoomInvite model instance',
    content: {'application/json': {schema: getModelSchemaRef(RoomInvite)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(RoomInvite, {
            title: 'NewRoomInvite',
            exclude: ['id'],
          }),
        },
      },
    })
    roomInvite: Omit<RoomInvite, 'id'>,
  ): Promise<RoomInvite> {
    const roomSettings = await this.roomController.findById(roomInvite.key)
    if(roomSettings.roomAccess === 3){
      throw HttpErrors.Unauthorized("You can not invite any your collegues to this room")
    }
    try {
      return await this.roomInviteRepository.create(roomInvite);
    } catch (error) {
      // Check if the error is the specific one thrown by the trigger
      if (error.code === 'ER_SIGNAL_EXCEPTION' && error.message.includes('A record with the same key and userId already exists')) {
        // Throw a 409 Conflict error
        throw new HttpErrors.Conflict('A record with the same key and userId already exists.');
      } else {
        // If it's not the specific error we are looking for, rethrow the original error
        throw error;
      }
    }
  }

  @get('/room-invites/count')
  @response(200, {
    description: 'RoomInvite model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(RoomInvite) where?: Where<RoomInvite>,
  ): Promise<Count> {
    return this.roomInviteRepository.count(where);
  }

  @get('/room-invites')
  @response(200, {
    description: 'Array of RoomInvite model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(RoomInvite, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(RoomInvite) filter?: Filter<RoomInvite>,
  ): Promise<RoomInvite[]> {
    return this.roomInviteRepository.find(filter);
  }

  @patch('/room-invites')
  @response(200, {
    description: 'RoomInvite PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(RoomInvite, {partial: true}),
        },
      },
    })
    roomInvite: RoomInvite,
    @param.where(RoomInvite) where?: Where<RoomInvite>,
  ): Promise<Count> {
    return this.roomInviteRepository.updateAll(roomInvite, where);
  }

  @get('/room-invites/{id}')
  @response(200, {
    description: 'RoomInvite model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(RoomInvite, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(RoomInvite, {exclude: 'where'}) filter?: FilterExcludingWhere<RoomInvite>
  ): Promise<RoomInvite> {
    return this.roomInviteRepository.findById(id, filter);
  }

  @get('/room-invites/user/{userId}')
@response(200, {
  description: 'Array of RoomInvite model instances for a specific user',
  content: {
    'application/json': {
      schema: {
        type: 'array',
        items: getModelSchemaRef(RoomInvite, {includeRelations: true}),
      },
    },
  },
})
async findByUserId(
  @param.path.string('userId') userId: string,
  @param.filter(RoomInvite, {exclude: 'where'}) filter?: Filter<RoomInvite>
): Promise<RoomInvite[]> {
  const whereFilter = {userId: userId};
  return this.roomInviteRepository.find({where: whereFilter, ...filter});
}


  @patch('/room-invites/{id}')
  @response(204, {
    description: 'RoomInvite PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(RoomInvite, {partial: true}),
        },
      },
    })
    roomInvite: RoomInvite,
  ): Promise<void> {
    await this.roomInviteRepository.updateById(id, roomInvite);
  }

  @put('/room-invites/{id}')
  @response(204, {
    description: 'RoomInvite PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() roomInvite: RoomInvite,
  ): Promise<void> {
    await this.roomInviteRepository.replaceById(id, roomInvite);
  }

  @del('/room-invites/{id}')
  @response(204, {
    description: 'RoomInvite DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.roomInviteRepository.deleteById(id);
  }

  @del('/room-invites/key/{key}')
@response(204, {
  description: 'RoomInvite DELETE success based on key',
})
async deleteByKey(@param.path.string('key') key: string): Promise<void> {
  await this.roomInviteRepository.deleteAll({key: key});
}
}
