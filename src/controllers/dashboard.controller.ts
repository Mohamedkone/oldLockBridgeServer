// Uncomment these imports to begin using these cool features!

import { get, param, response } from "@loopback/rest";
import { DirectbridgeRepository, IntegrationRepository, LivebridgeRepository } from "../repositories";
import { Count, CountSchema, repository, Where } from '@loopback/repository';
import { Livebridge } from "../models";
import { IntegrationController } from "./integration.controller";

// import {inject} from '@loopback/core';


export class DashboardController {
  constructor(
    @repository(LivebridgeRepository)
    public livebridgeRepository: LivebridgeRepository,
    @repository(DirectbridgeRepository)
    public directbridgeRepository: DirectbridgeRepository,
    @repository(IntegrationRepository)
    public integrationRepository: IntegrationRepository,
  ) {}

@get('/dashboard/count/{id}')
  @response(200, {
    description: 'dashboard bridges count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.path.string('id') id: string
  ): Promise<Object> {
    const direct = await this.directbridgeRepository.count({
      ownerId: id
    })
    const live = await this.livebridgeRepository.find(
    {
      where:{
        ownerId: id
      },
      limit:4
    })
    const integ = await this.integrationRepository.find({
      where:{
        ownerId: id
      } 
    })
    const newlive = []
    const newinteg = []
    for(let x of live){
      newlive.push({id:x.id, exp:x.exp , alias:x.alias})
    }
    for (let x of integ){
      newinteg.push({host:x.host,status:x.status})
    }
    // const test = 
  return ({
    count:live.length+direct.count+integ.length,
    integrationBridges: newinteg,
    liveBridges: newlive,
  })
  }

}