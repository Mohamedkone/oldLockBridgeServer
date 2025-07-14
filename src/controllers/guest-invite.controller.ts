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
import {GuestInvite} from '../models';
import {GuestInviteRepository} from '../repositories';
import { HttpErrors } from '@loopback/rest';
import {inject} from '@loopback/core';
import {RoomsController} from './rooms.controller';

export class GuestInviteController {
  constructor(
    @inject('controllers.RoomsController')
    private roomRepository : RoomsController,
    @repository(GuestInviteRepository)
    public guestInviteRepository : GuestInviteRepository,
  ) {}

  @post('/guest-invites')
  @response(200, {
    description: 'GuestInvite model instance',
    content: {'application/json': {schema: getModelSchemaRef(GuestInvite)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(GuestInvite, {
            title: 'NewGuestInvite',

          }),
        },
      },
    })
    guestInvite: Omit<GuestInvite, 'id'>,
  ): Promise<GuestInvite> {
    const roomSettings = await this.roomRepository.findById(guestInvite.key)
    if(roomSettings.roomAccess === 2){
      throw HttpErrors.Unauthorized('You can not invite any guest to this room')
    }
    try {
      return await this.guestInviteRepository.create(guestInvite);
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

  @get('/guest-invites/count')
  @response(200, {
    description: 'GuestInvite model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(GuestInvite) where?: Where<GuestInvite>,
  ): Promise<Count> {
    return this.guestInviteRepository.count(where);
  }

  @get('/guest-invites')
  @response(200, {
    description: 'Array of GuestInvite model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(GuestInvite, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(GuestInvite) filter?: Filter<GuestInvite>,
  ): Promise<GuestInvite[]> {
    return this.guestInviteRepository.find(filter);
  }

  @patch('/guest-invites')
  @response(200, {
    description: 'GuestInvite PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(GuestInvite, {partial: true}),
        },
      },
    })
    guestInvite: GuestInvite,
    @param.where(GuestInvite) where?: Where<GuestInvite>,
  ): Promise<Count> {
    return this.guestInviteRepository.updateAll(guestInvite, where);
  }

  @get('/guest-invites/{id}')
  @response(200, {
    description: 'GuestInvite model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(GuestInvite, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(GuestInvite, {exclude: 'where'}) filter?: FilterExcludingWhere<GuestInvite>
  ): Promise<GuestInvite> {
    return this.guestInviteRepository.findById(id, filter);
  }

  @get('/MyInvites/{email}')
  @response(200, {
    description: 'GuestInvite model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(GuestInvite, {includeRelations: true}),
      },
    },
  })
  async findByEmail(
    @param.path.string('email') email: string,
    @param.filter(GuestInvite, {exclude: 'where'}) filter?: FilterExcludingWhere<GuestInvite>
  ): Promise<object | null> {
    return this.guestInviteRepository.find({where:{userId:email}, ...filter});
  }

  @patch('/guest-invites/{id}')
  @response(204, {
    description: 'GuestInvite PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(GuestInvite, {partial: true}),
        },
      },
    })
    guestInvite: GuestInvite,
  ): Promise<void> {
    await this.guestInviteRepository.updateById(id, guestInvite);
  }

  @put('/guest-invites/{id}')
  @response(204, {
    description: 'GuestInvite PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() guestInvite: GuestInvite,
  ): Promise<void> {
    await this.guestInviteRepository.replaceById(id, guestInvite);
  }

  @del('/guest-invites/key/{key}')
  @response(204, {
    description: 'GuestInvite DELETE success',
  })
  async delete(@param.path.string('key') key: string): Promise<void> {
    await this.guestInviteRepository.deleteAll({key:key});
  }

  @del('/guest-invite-list/{companyId}/{userId}')
@response(204, {
  description: 'GuestList DELETE success',
})
async deleteGroup(
  @param.path.string('userId') userId: string,
  @param.path.string('companyId') companyId: string
): Promise<void> {
  await this.guestInviteRepository.deleteAll({
      userId: userId,
      companyId: companyId,
  });
}
}
