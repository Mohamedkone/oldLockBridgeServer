import {
  Count,
  CountSchema,
  Filter,
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
import { Socket } from 'socket.io'
import {NodesFls} from '../models';
import {NodesFlsRepository} from '../repositories';
import { inject } from '@loopback/core';

export class NodesFlsController {
  constructor(
    @repository(NodesFlsRepository)
    public nodesFlsRepository : NodesFlsRepository,
    @inject('services.socketio')
    private io: Socket,
  ) {}

  @post('/nodes-fls')
  @response(200, {
    description: 'NodesFls model instance',
    content: {'application/json': {schema: getModelSchemaRef(NodesFls)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NodesFls, {
            title: 'NewNodesFls',

          }),
        },
      },
    })
    nodesFls: NodesFls,
  ): Promise<NodesFls> {
    const res = await this.nodesFlsRepository.create(nodesFls);
    const roomId = res.roomId;
    this.io.to(roomId).emit('new-data', res)
    return res
  }

  @get('/nodes-fls/count')
  @response(200, {
    description: 'NodesFls model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(NodesFls) where?: Where<NodesFls>,
  ): Promise<Count> {
    return this.nodesFlsRepository.count(where);
  }

  @get('/nodes-fls')
  @response(200, {
    description: 'Array of NodesFls model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(NodesFls, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(NodesFls) filter?: Filter<NodesFls>,
  ): Promise<NodesFls[]> {
    return this.nodesFlsRepository.find(filter);
  }

  @patch('/nodes-fls')
  @response(200, {
    description: 'NodesFls PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NodesFls, {partial: true}),
        },
      },
    })
    nodesFls: NodesFls,
    @param.where(NodesFls) where?: Where<NodesFls>,
  ): Promise<Count> {
    return this.nodesFlsRepository.updateAll(nodesFls, where);
  }

  @get('/nodes-fls/room/{roomId}')
  @response(200, {
    description: 'Array of NodesFls model instances by Room ID',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(NodesFls, {includeRelations: true}),
        },
      },
    },
  })
  async findByRoomId(
    @param.path.string('roomId') roomId: string,
    @param.filter(NodesFls) filter?: Filter<NodesFls>
  ): Promise<NodesFls[]> {
    // Apply additional filters if any provided in the request
    const whereFilter = {roomId: roomId, ...filter?.where};
    return this.nodesFlsRepository.find({ ...filter, where: whereFilter });
  }

  @patch('/nodes-fls/{id}')
  @response(204, {
    description: 'NodesFls PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NodesFls, {partial: true}),
        },
      },
    })
    nodesFls: NodesFls,
  ): Promise<void> {
    await this.nodesFlsRepository.updateById(id, nodesFls);
  }

  @put('/nodes-fls/{id}')
  @response(204, {
    description: 'NodesFls PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() nodesFls: NodesFls,
  ): Promise<void> {
    await this.nodesFlsRepository.replaceById(id, nodesFls);
  }

  @del('/nodes-fls/{roomId}/{id}')
  @response(204, {
    description: 'NodesFls DELETE success',
  })
  async deleteById(
    @param.path.string('id') id: string,
    @param.path.string('roomId') roomId: string
  ): Promise<void> {
    await this.nodesFlsRepository.deleteById(id);
    this.io.to(roomId).emit('data-deleted', {id:id})
  }

  @del('/nodes-fls-job/{roomId}/{id}')
  @response(204, {
    description: 'NodesFls DELETE success',
  })
  async deleteByFile(
    @param.path.string('id') id: string,
    @param.path.string('roomId') roomId: string
  ): Promise<void> {
    const where = {filename:id}
    await this.nodesFlsRepository.deleteAll(where);
    this.io.to(roomId).emit('data-deleted', {id:id})
  }

  @del('/nodes-fls/{roomId}')
  @response(204, {
    description: 'All NodesFls instances with the specified Room ID deleted successfully',
  })
  async deleteByRoomId(
    @param.path.string('roomId') roomId: string
  ): Promise<void> {
    const where = { roomId: roomId };
    await this.nodesFlsRepository.deleteAll(where);
  }

  @del('/nodes-fls/node/{nodeId}')
  @response(204, {
    description: 'All NodesFls instances with the specified Room ID deleted successfully',
  })
  async deleteByNodeId(
    @param.path.string('nodeId') nodeId: string
  ): Promise<void> {
    const where = { nodeId: nodeId };
    await this.nodesFlsRepository.deleteAll(where);
  }

}
