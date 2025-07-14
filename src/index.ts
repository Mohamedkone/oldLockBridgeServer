import * as socketIo from 'socket.io';
import {ApplicationConfig, BackEndApplication} from './application';
// import * as http from 'http'
import {RestServer} from '@loopback/rest';
import {GuestInviteRepository, RoomInviteRepository, RoomsRepository} from './repositories';
import {roomHandler} from './room';

export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new BackEndApplication(options);
  await app.boot();
  await app.start();

  const restServer = await app.getServer(RestServer);

  // Access the underlying HTTP/HTTPS server
  const httpServer = restServer.httpServer?.server;

  if (!httpServer) {
    throw new Error('HTTP Server not found');
  }

  const redis = require('./datasources/redis.datasource')
  // const port = process.env.PORT ?? 3001;
  redis.connection()

  // socket Io
  // const server = http.createServer(app.requestHandler)
  const io = new socketIo.Server(httpServer,{
    cors: {
      origin: ["http://localhost:3000", "http://localhost:5173", "https://app.lockbridge.io", "https://dev.lockbridge.io"],
      methods: ["GET", "POST"]
    }
  })
  app.bind('services.socketio').to(io);
  const roomRepo = await app.getRepository(RoomsRepository);
  const roomInvRepo = await app.getRepository(RoomInviteRepository);
  const guestInvRepo = await app.getRepository(GuestInviteRepository);
  io.on('connection', (socket)=>{
      roomHandler(socket, roomRepo, roomInvRepo, guestInvRepo)
      socket.on('disconnect', ()=>{
    })
  })

  // server.listen(port,()=>{
  //   console.log(`Server is running on port ${port}`);
  // })

  // const url = app.restServer.url;
  console.log(`Server is running properly`);
  // console.log(`Try ${url}/ping`);
  return app;
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: +(process.env.PORT ?? 3001),
      host: process.env.HOST,
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        // setServersFromRequest: true, for Dev env
        disabled: true, //for production
      },
      cors:{
        origin:["http://localhost:3000", "https://app.lockbridge.io","http://localhost:5173","http://localhost:5174", "https://dev.lockbridge.io", "http://localhost:3002", "http://localhost:9000", "https://nodes0413.lockbridge.io", "http://localhost:5173", "https://onboarding.lockbridge.io"],
        credentials: true,
        methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        headers: '*',

      },
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
