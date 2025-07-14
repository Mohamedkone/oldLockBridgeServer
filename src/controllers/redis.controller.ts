// This controller is for testing purpose only
import {
  post,
  get,del
} from '@loopback/rest';
const redisDb = require('../datasources/redis.datasource')


const client = redisDb.client
export class RedisController {

  constructor(

  ) {}

  @post('/save-key')
  async saveDataToRedis(): Promise<Boolean> {
    const verify = await client.get('fowo')
    if(verify === null){
      await client.set('fowo', 'bawr')
      return true
    }
    return false
  }
  @get('/get-key')
  async getDataFromRedis(): Promise<Object> {
    try{
      const data = await client.get('key_name_which_you_want_to_Set')
      return data
    }
    catch (exception){
      return exception
    }

  }

  @del('/delete-key')
  async removeDataFromRedis(): Promise<Boolean | string> {
  try{
    await client.delete('key_name_which_you_want_to_Set')
    return true
  }
  catch (exception) {
    return `Error: ${exception}`
  }


  }
}
