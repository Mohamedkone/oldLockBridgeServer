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
import {GuestList} from '../models';
import {GuestListRepository} from '../repositories';
import { inject } from '@loopback/core';
import {GuestInviteController} from './guest-invite.controller';

export class GuestListController {
  constructor(
    @inject('controllers.GuestInviteController')
    private guestInviteController: GuestInviteController,
    @repository(GuestListRepository)
    public guestListRepository : GuestListRepository,
  ) {}

  @post('/guest-lists')
  @response(200, {
    description: 'GuestList model instance',
    content: {'application/json': {schema: getModelSchemaRef(GuestList)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(GuestList, {
            title: 'NewGuestList',
            exclude: ['id'],
          }),
        },
      },
    })
    guestList: Omit<GuestList, 'id'>,
  ): Promise<GuestList> {

    return this.guestListRepository.create(guestList);
  }
  @post('/guest-lists/{company}/{guest}')
  @response(200, {
    description: 'GuestList model instance',
    content: {'application/json': {schema: getModelSchemaRef(GuestList)}},
  })
  async adding(
    @param.path.string('company') company: string,
    @param.path.string('guest') guest: string
  ): Promise<GuestList> {
    const res = await this.guestListRepository.findOne({where:{
      guestId:guest,
      companyId:company
    }})
    if(res){
      throw HttpErrors.Conflict("A record with the same email already exists.")
    }
    return this.guestListRepository.create({guestId:guest,companyId:company});
  }

  @get('/guest-lists/count')
  @response(200, {
    description: 'GuestList model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(GuestList) where?: Where<GuestList>,
  ): Promise<Count> {
    return this.guestListRepository.count(where);
  }

  @get('/guest-lists')
  @response(200, {
    description: 'Array of GuestList model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(GuestList, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(GuestList) filter?: Filter<GuestList>,
  ): Promise<GuestList[]> {
    return this.guestListRepository.find(filter);
  }

  @patch('/guest-lists')
  @response(200, {
    description: 'GuestList PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(GuestList, {partial: true}),
        },
      },
    })
    guestList: GuestList,
    @param.where(GuestList) where?: Where<GuestList>,
  ): Promise<Count> {
    return this.guestListRepository.updateAll(guestList, where);
  }

  @get('/guest-lists/dwa/{id}')
  @response(200, {
    description: 'GuestList model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(GuestList, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(GuestList, {exclude: 'where'}) filter?: FilterExcludingWhere<GuestList>
  ): Promise<GuestList> {
    return this.guestListRepository.findById(id, filter);
  }
  @get('/guest-lists/{compId}')
  @response(200, {
    description: 'GuestList model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(GuestList, {includeRelations: true}),
      },
    },
  })
  async findByComp(
    @param.path.string('compId') compId: string,
    @param.filter(GuestList, {exclude: 'where'}) filter?: FilterExcludingWhere<GuestList>
  ): Promise<object | null> {
    return this.guestListRepository.find({where:{companyId: compId}});
  }

  @patch('/guest-lists/{id}')
  @response(204, {
    description: 'GuestList PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(GuestList, {partial: true}),
        },
      },
    })
    guestList: GuestList,
  ): Promise<void> {
    await this.guestListRepository.updateById(id, guestList);
  }

  @put('/guest-lists/{id}')
  @response(204, {
    description: 'GuestList PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() guestList: GuestList,
  ): Promise<void> {
    await this.guestListRepository.replaceById(id, guestList);
  }

  @del('/guest-lists/{companyId}/{guestId}')
@response(204, {
  description: 'GuestList DELETE success',
})
async deleteById(
  @param.path.string('guestId') guestId: string,
  @param.path.string('companyId') companyId: string
): Promise<void> {
  const guestList = await this.guestListRepository.findOne({
    where: {
      guestId: guestId,
      companyId: companyId,
    },
  });

  if (guestList) {
    await this.guestListRepository.deleteById(guestList.id);
    await this.guestInviteController.deleteGroup(guestId, companyId)
  }
}

}
