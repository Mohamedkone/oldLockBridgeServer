import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {v4 as uuidv4} from 'uuid';
import {Users} from '../models';
import {UsersRepository} from '../repositories';
import { inject } from '@loopback/core';
import { CompanyController } from './company.controller';

const redisDb = require('../datasources/redis.datasource')
const client = redisDb.client
const jwt = require('jsonwebtoken')


export class UsersController {
  constructor(
    @inject('controllers.CompanyController')
    private companyCont: CompanyController,
    @repository(UsersRepository)
    public usersRepository: UsersRepository,
  ) { }

  @post('/users')
  @response(200, {
    description: 'Users model instance',
    content: {'application/json': {schema: getModelSchemaRef(Users)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Users, {
            title: 'NewUsers',

          }),
        },
      },
    })
    users: Users,
  ): Promise<Users> {
    // Check if email already exists
    const existingUserWithEmail = await this.usersRepository.findOne({
      where: {email: users.email},
    });

    if (existingUserWithEmail) {
      throw new HttpErrors.Conflict('A record with the same email already exists.');
    }

    // Generate unique ID and ensure it does not exist in the database
    let uniqueId = uuidv4();
    let existingUserWithId = await this.usersRepository.findById(uniqueId).catch(() => null);

    while (existingUserWithId) {
      uniqueId = uuidv4();
      existingUserWithId = await this.usersRepository.findById(uniqueId).catch(() => null);
    }

    // Set the generated unique ID and added date
    users.id = uniqueId;
    const date = new Date();
    users.addedDate = date.toISOString();

    return this.usersRepository.create(users);
  }

  @get('/users/count')
  @response(200, {
    description: 'Users model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Users) where?: Where<Users>,
  ): Promise<Count> {
    return this.usersRepository.count(where);
  }


  @get('/users/{comp}')
  @response(200, {
    description: 'Array of Users model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Users, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.path.string('comp') comp: string,
    @param.filter(Users) filter?: Filter<Users>,
  ): Promise<Users[]> {
    const companyFilter = {where: {company: comp}};
    const effectiveFilter = {...filter, ...companyFilter};
    return this.usersRepository.find(effectiveFilter);
  }

  @patch('/users')
  @response(200, {
    description: 'Users PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Users, {partial: true}),
        },
      },
    })
    users: Users,
    @param.where(Users) where?: Where<Users>,
  ): Promise<Count> {
    return this.usersRepository.updateAll(users, where);
  }


  @get('/users/log/{sub}')
  @response(200, {
    description: 'Users model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Users, {includeRelations: true}),
      },
    },
  })
  async findSub(
    @param.path.string('sub') sub: string
  ): Promise<Users | null> {
    const res = this.usersRepository.findOne({where: {sub}});
    if(res === null){
      return null
    }
    else{
      // const res2 = this.companyCont.find({where:{}})
      console.log(res)
      return res
    }
  }
  @get('/users/logO/{subOAuth}')
  @response(200, {
    description: 'Users model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Users, {includeRelations: true}),
      },
    },
  })
  async findSubAuth(
    @param.path.string('subOAuth') subOAuth: string
  ): Promise<any | null> {
    const res= await this.usersRepository.findOne({where: {subOAuth}});
    if(res === null){
      return null
    }
    else{
      const res2 = await this.companyCont.findById(res.company)
      return {...res, isPersonal: res2.isPersonal}
    }
  }
  @get('/users/email/{email}')
  @response(200, {
    description: 'Users model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Users, {includeRelations: true}),
      },
    },
  })
  async findEmail(
    @param.path.string('email') email: string
  ): Promise<Users | null> {
    return this.usersRepository.findOne({where: {email}});
  }

  @get('/login/{sub}')
  @response(200, {
    description: 'Users model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Users, {includeRelations: true}),
      },
    },
  })
  async findOnelogin(
    @param.path.string('sub') sub: string
  ): Promise<Object | null> {
    if (!sub) return null
    const mySub = await this.usersRepository.findOne({
      where: {
        or: [
          {sub: sub},
          {subOAuth: sub},
        ]
      }
    })
    if (mySub !== null) {
      const token = jwt.sign(mySub.email, 'randomstringme')
      const verify = await client.get(token)
      if (verify === null) {
        await client.set(token, sub, {EX: 36000})
      }
      return {main: await this.usersRepository.findOne({where: {or: [{sub: sub}, {subOAuth: sub}]}}), email: mySub.email, token: token}
    }
    return null
  }

  @patch('/users/{id}')
  @response(204, {
    description: 'Users PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Users, {partial: true}),
        },
      },
    })
    users: Users,
  ): Promise<void> {
    await this.usersRepository.updateById(id, users);
  }

  @put('/users/{id}')
  @response(204, {
    description: 'Users PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() users: Users,
  ): Promise<void> {
    await this.usersRepository.replaceById(id, users);
  }

  @del('/users/{id}')
  @response(204, {
    description: 'Users DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.usersRepository.deleteById(id);
  }
}
