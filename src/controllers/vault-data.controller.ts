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
import {VaultData} from '../models';
import {VaultDataRepository} from '../repositories';
import { v4 as uuidv4} from 'uuid';
import { HttpStatusCode } from 'axios';

export class VaultDataController {
  constructor(
    @repository(VaultDataRepository)
    public vaultDataRepository : VaultDataRepository,
  ) {}

  @post('/vdata')
  @response(200, {
    description: 'VaultData model instance',
    content: {'application/json': {schema: getModelSchemaRef(VaultData)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(VaultData, {
            title: 'NewVaultData',
            
          }),
        },
      },
    })
    vaultData: VaultData,
  ): Promise<VaultData> {
    const id = uuidv4()
    const now = new Date();
    const formatted = now.toISOString().slice(0, 19).replace("T", " ");
    vaultData.id = `${id.substring(0,12)}-${Date.now().toString()}`
    vaultData.createdAt = formatted
    return this.vaultDataRepository.create(vaultData);
  }

  @get('/vdata/count')
  @response(200, {
    description: 'VaultData model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(VaultData) where?: Where<VaultData>,
  ): Promise<Count> {
    return this.vaultDataRepository.count(where);
  }

  @get('/vdata')
  @response(200, {
    description: 'Array of VaultData model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(VaultData, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(VaultData) filter?: Filter<VaultData>,
  ): Promise<VaultData[]> {
    return this.vaultDataRepository.find(filter);
  }

  @patch('/vdata')
  @response(200, {
    description: 'VaultData PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(VaultData, {partial: true}),
        },
      },
    })
    vaultData: VaultData,
    @param.where(VaultData) where?: Where<VaultData>,
  ): Promise<Count> {
    return this.vaultDataRepository.updateAll(vaultData, where);
  }

  @get('/vdata/{id}')
  @response(200, {
    description: 'VaultData model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(VaultData, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(VaultData, {exclude: 'where'}) filter?: FilterExcludingWhere<VaultData>
  ): Promise<VaultData[]> {

    const test = this.vaultDataRepository.find({where:{
      ownerId: id
    }});
    return test
  }

  @patch('/vdata/{id}')
  @response(204, {
    description: 'VaultData PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(VaultData, {partial: true}),
        },
      },
    })
    vaultData: VaultData,
  ): Promise<void> {
    await this.vaultDataRepository.updateById(id, vaultData);
  }

  @put('/vdata/{id}')
  @response(204, {
    description: 'VaultData PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() vaultData: VaultData,
  ): Promise<void> {
    await this.vaultDataRepository.replaceById(id, vaultData);
  }

  @put('/vdata/{id}/move')
async moveVaultItem(
  @param.path.string('id') id: string,
  @requestBody() moveRequest: { newParentId: string },
): Promise<HttpStatusCode> {
  const item = await this.vaultDataRepository.findById(id);

  // Handle root as valid parent without checking DB
  if (moveRequest.newParentId === 'root') {
    // Simple update for moving to root
    await this.vaultDataRepository.updateById(id, {
      parentId: 'root'
    });
    return 409;
  }

  // Validate non-root parent exists and is a folder
  const parent = await this.vaultDataRepository.findById(moveRequest.newParentId);
  
  if (!parent || parent.type !== 'folder') {
    throw new HttpErrors.BadRequest('Invalid target folder');
  }

  // Prevent moving into itself
  if (moveRequest.newParentId === id) {
    throw new HttpErrors.BadRequest('Cannot move item into itself');
  }

  // Update parent ID
  await this.vaultDataRepository.updateById(id, {
    parentId: moveRequest.newParentId
  });
  return 200
}

  @del('/vdata/{id}')
  @response(204, {
    description: 'VaultData DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.vaultDataRepository.deleteById(id);
  }
}
