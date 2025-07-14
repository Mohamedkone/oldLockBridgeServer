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
import {Guests} from '../models';
import {GuestsRepository} from '../repositories';
import {v4 as uuidv4} from 'uuid';
import {inject} from '@loopback/core';
import {GuestListController} from './guest-list.controller';
import {HttpStatusCode} from 'axios';
const redisDb = require('../datasources/redis.datasource')
const client = redisDb.client
const jwt = require('jsonwebtoken')

export class GuestsController {
  constructor(
    @inject('controllers.GuestListController')
    private guestListController: GuestListController,
    @repository(GuestsRepository)
    public guestsRepository : GuestsRepository,
  ) {}

  @post('/guests')
  @response(200, {
    description: 'Guests model instance',
    content: {'application/json': {schema: getModelSchemaRef(Guests)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Guests, {
            title: 'NewGuests',

          }),
        },
      },
    })
    guests: Guests,
  ): Promise<Guests | String> {
    const existingGuestWithEmail = await this.guestsRepository.findOne({
      where: {email: guests.email},
    });

    if (existingGuestWithEmail) {
      try{
        await this.guestListController.adding(guests.company, guests.email)
        return HttpStatusCode[200]
      }
      catch{
        throw new HttpErrors.Conflict('A record with the same email already exists.');
      }
    }

    // Generate unique ID and ensure it does not exist in the database
    let uniqueId = uuidv4();
    let existingUserWithId = await this.guestsRepository.findById(uniqueId).catch(() => null);

    while (existingUserWithId) {
      uniqueId = uuidv4();
      existingUserWithId = await this.guestsRepository.findById(uniqueId).catch(() => null);
    }

    // Set the generated unique ID and added date
    guests.id = uniqueId;
    const date = new Date();
    guests.addedDate = date.toISOString();
    guests.deleteOn = new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString();

    return this.guestsRepository.create(guests);
  }

  @get('/guests/count')
  @response(200, {
    description: 'Guests model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Guests) where?: Where<Guests>,
  ): Promise<Count> {
    return this.guestsRepository.count(where);
  }

  @get('/guests')
  @response(200, {
    description: 'Array of Guests model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Guests, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Guests) filter?: Filter<Guests>,
  ): Promise<Guests[]> {
    return this.guestsRepository.find(filter);
  }

  @patch('/guests')
  @response(200, {
    description: 'Guests PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Guests, {partial: true}),
        },
      },
    })
    guests: Guests,
    @param.where(Guests) where?: Where<Guests>,
  ): Promise<Count> {
    return this.guestsRepository.updateAll(guests, where);
  }

  @get('/guests/{id}')
  @response(200, {
    description: 'Guests model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Guests, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Guests, {exclude: 'where'}) filter?: FilterExcludingWhere<Guests>
  ): Promise<Guests> {
    return this.guestsRepository.findById(id, filter);
  }
  @get('/guestsEmail/{email}')
  @response(200, {
    description: 'Guests model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Guests, {includeRelations: true}),
      },
    },
  })
  async findByEmail(
    @param.path.string('email') email: string,
    @param.filter(Guests, {exclude: 'where'}) filter?: FilterExcludingWhere<Guests>
  ): Promise<Guests> {
    const guest = await this.guestsRepository.findOne({where: {email: email}, ...filter});
    if (!guest) {
      throw new Error(`Entity not found: Guests with email "${email}"`);
    }
    return guest;
  }

  @get('/guestLogin/{email}')
  @response(200, {
    description: 'Guests model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Guests, {includeRelations: true}),
      },
    },
  })
  async findGuest(
    @param.path.string('email') email: string,
    @param.filter(Guests, {exclude: 'where'}) filter?: FilterExcludingWhere<Guests>
  ): Promise<object | null> {
    const guest = await this.guestsRepository.findOne({where: {email: email}, ...filter});
    if (!guest) {
      throw new Error(`Entity not found: Guests with email "${email}"`);
    }
    const token = jwt.sign(email, 'randomstringme')
    const verify = await client.get(token)
    if(verify === null){
      await client.set(token, email, {EX:36000})
    }
    return {main:guest, email: email , token:token};
  }

  @patch('/guests/{id}')
  @response(204, {
    description: 'Guests PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Guests, {partial: true}),
        },
      },
    })
    guests: Guests,
  ): Promise<void> {
    await this.guestsRepository.updateById(id, guests);
  }

  @put('/guests/{id}')
  @response(204, {
    description: 'Guests PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() guests: Guests,
  ): Promise<void> {
    await this.guestsRepository.replaceById(id, guests);
  }

  @del('/guests/{id}')
  @response(204, {
    description: 'Guests DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.guestsRepository.deleteById(id);
  }
}
