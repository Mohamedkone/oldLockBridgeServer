import { createClient } from 'redis';

const client = createClient({
  password: "6I6gNosQ2HDnVkyulevYy7QqhBC7Kynz",
  socket: {
      host: "redis-12662.c13.us-east-1-3.ec2.redns.redis-cloud.com",
      port: 12662
  }

});
client.on('error', (err) => console.log('Redis Cluster Error', err));



const connection = async() => {
  await client.connect()
}
exports.connection = connection
exports.client = client
