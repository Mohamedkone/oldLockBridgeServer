import {Socket} from 'socket.io';
import {Rooms} from '../models';
import {GuestInviteRepository, RoomInviteRepository, RoomsRepository} from '../repositories';
const crypto = require('crypto');



const rooms: Record<string, RoomData> = {}
let roomsLoaded = false; // Flag to check if rooms have been loaded


interface IRoomParams {
  roomId: string;
  peerId: string;
}
interface IAdmin {
  name: string;
  admin: string;
  type: string;
  uLimit: number;
  roomAccess: number;
  roomActions: number;
  sizeLimit: number
  fileStoringLength: number
}
interface RoomData {
  ids: string[]
  logs: string[]
  name: string,
  admin: string
  locked: boolean
  uLimit: number;
  roomAccess: number;
  roomActions: number;
  sizeLimit: number
  fileStoringLength: number
}


export const roomHandler = (socket: Socket, roomRepo: RoomsRepository, roomInvRepo: RoomInviteRepository, guestInvRepo: GuestInviteRepository) => {


  const createRoom = async ({admin, type, name, roomAccess, roomActions, uLimit, sizeLimit, fileStoringLength}: IAdmin) => {
    console.log(`creating:`,admin, type, name, roomAccess, roomActions, uLimit, sizeLimit, fileStoringLength)
    sizeLimit=1000
    crypto.randomBytes(20).toString('hex')
    const roomId = crypto.randomBytes(20).toString('hex')
    const roomData: RoomData = {
      ids: [],
      logs: [],
      name,
      admin,
      locked: false,
      uLimit,
      roomAccess,
      roomActions,
      sizeLimit,
      fileStoringLength
    };
    const room = new Rooms({
      id: roomId,
      admin,
      name,
      uLimit,
      roomAccess,
      roomActions,
      type: type,
      locked: false,
      sizeLimit,
      fileStoringLength
    });
    await roomRepo.create(room);
    rooms[roomId] = roomData
    socket.emit("room-created", {roomId, admin, type})
    console.log('user created the room')
  }

  const joinRoom = ({roomId, peerId}: IRoomParams) => {
    if (rooms[roomId]) {
      if (rooms[roomId].ids.length < rooms[roomId].uLimit) {
        if (rooms[roomId].locked === false || rooms[roomId].admin === peerId) {
          if (!rooms[roomId].ids.includes(peerId)) {
            console.log(`user joined the room ${roomId} with id ${peerId}`)
            rooms[roomId].ids.push(peerId)
            console.log(rooms[roomId])
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            socket.join(roomId)
            socket.to(roomId).emit("user-joined", {peerId})
            socket.emit('get-users', {
              participants: rooms[roomId].ids,
              peerId,
              admin: rooms[roomId].admin,
              locked: rooms[roomId].locked,
              roomAccess: rooms[roomId].roomAccess,
              roomActions: rooms[roomId].roomActions
            })
          }
          else {
            console.log('already')
            socket.emit("already-in-use", {peerId})
          }
        } else {
          socket.emit("admin-locked", {peerId})
        }
      } else {
        socket.emit("room-limit", {peerId})
      }
    }
    socket.on('disconnect', () => {
      leaveRoom({roomId, peerId})
    })
  }
  const joinRoomRTC = ({roomId, peerId}: IRoomParams) => {
    console.log(rooms[roomId].ids)
    if (rooms[roomId]) {
      if (rooms[roomId].ids.length < rooms[roomId].uLimit) {
        if (rooms[roomId].locked === false || rooms[roomId].admin === peerId) {
          if (!rooms[roomId].ids.includes(peerId)) {
            console.log(`user joined the room ${roomId} with id ${peerId}`)
            rooms[roomId].ids.push(peerId)
            console.log(rooms[roomId])
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            socket.join(roomId)
            socket.to(roomId).emit("user-joined", {peerId})
            socket.emit('get-usersRTC', {
              participants: rooms[roomId].ids,
              peerId,
              admin: rooms[roomId].admin,
              locked: rooms[roomId].locked,
              roomAccess: rooms[roomId].roomAccess,
              roomActions: rooms[roomId].roomActions
            })
          }
          else {
            console.log('already')
            socket.emit("already-in-use", {peerId})
          }
        } else {
          socket.emit("admin-locked", {peerId})
        }
      } else {
        socket.emit("room-limit", {peerId})
      }
    }
    socket.on('disconnect', () => {
      leaveRoom({roomId, peerId})
    })
  }

  const lockRoom = async ({roomId, peerId}: IRoomParams) => {
    const room = await roomRepo.findById(roomId);
    console.log("testNOk")
    if (room && peerId === room.admin) {
      console.log("testOk")
      await roomRepo.updateById(roomId, {locked: true})
      if (rooms[roomId]) {
        rooms[roomId].locked = true
        console.log(rooms[roomId])
      }
    }
  }

  const unlockRoom = async ({roomId, peerId}: IRoomParams) => {
    const room = await roomRepo.findById(roomId);
    console.log("testNOk")
    if (room && peerId === room.admin) {
      console.log("testOk")
      await roomRepo.updateById(roomId, {locked: false})
      if (rooms[roomId]) {
        rooms[roomId].locked = false
        console.log(rooms[roomId])
      }
    }
  }

  const fetchFiles = ({roomId}: IRoomParams) => {
    if (rooms[roomId]) {
      socket.emit('new-data')
      socket.to(roomId).emit('new-data')
    }
  }
  const removedFiles = ({roomId}: IRoomParams) => {
    if (rooms[roomId]) {
      console.log(roomId, 'ok')
      socket.emit('data-deleted')
      socket.to(roomId).emit('new-data')
    }
  }

  const leaveRoom = ({roomId, peerId}: IRoomParams) => {
    if (rooms[roomId]) {
      rooms[roomId].ids = rooms[roomId].ids.filter((id) => id !== peerId)
      socket.to(roomId).emit("user-disconnected", peerId)
      console.log('user left the room', peerId)
    }
  }
  const closeRoom = async ({roomId, peerId}: IRoomParams) => {
    const room = await roomRepo.findById(roomId);
    if (room && peerId === room.admin) {
      await roomRepo.deleteById(roomId);
      await roomInvRepo.deleteAll({key: roomId});
      await guestInvRepo.deleteAll({key: roomId});
      delete rooms[roomId];
      socket.to(roomId).emit("room-closed", {roomId});
      socket.emit("delete-closed", {roomId});
      console.log(`Room ${roomId} closed by admin ${peerId}`);
      socket.to(roomId).disconnectSockets(true);
    }
  }

  const closeRoomRtc = async ({roomId, peerId}: IRoomParams) => {
    const room = await roomRepo.findById(roomId);
    if (room && peerId === room.admin) {
      await roomRepo.deleteById(roomId);
      await roomInvRepo.deleteAll({key: roomId});
      await guestInvRepo.deleteAll({key: roomId});
      delete rooms[roomId];
      socket.to(roomId).emit("room-closedRtc", {roomId});
      socket.emit("delete-closedRtc", {roomId});
      console.log(`Room ${roomId} closed by admin ${peerId}`);
      socket.to(roomId).disconnectSockets(true);
    }
  }

  const loadRooms = async () => {
    if (!roomsLoaded) {
      try {
        const allRooms = await roomRepo.find();
        for (const room of allRooms) {
          rooms[room.id] = {
            ids: [],
            logs: [],
            name: room.name,
            admin: room.admin,
            locked: room.locked,
            uLimit: room.uLimit,
            roomAccess: room.roomAccess,
            roomActions: room.roomActions,
            sizeLimit: room.sizeLimit,
            fileStoringLength: room.fileStoringLength
          };
          await socket.join(room.id);
        }
        roomsLoaded = true;
      } catch (err) {
        console.log(`Error loading rooms:`, err);
      }
    }
  };

  loadRooms().catch(console.error);

  socket.on('create-room', createRoom)
  socket.on('join-room', joinRoom)
  socket.on('join-roomRTC', joinRoomRTC)
  socket.on('lock-room', lockRoom)
  socket.on('unlock-room', unlockRoom)
  socket.on('leave-room', leaveRoom)
  socket.on('close-room', closeRoom)
  socket.on('close-roomRtc', closeRoomRtc)
  socket.on('file-added', fetchFiles)
  socket.on('file-removed', removedFiles)
}



