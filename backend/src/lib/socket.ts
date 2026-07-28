import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthPayload } from '../types/express';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: env.corsOrigin,
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, env.jwtAccessSecret) as AuthPayload;
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user as AuthPayload;
    console.log(`User connected to socket: ${user.userId}`);

    // Join a private room for the user to receive targeted notifications
    socket.join(`user:${user.userId}`);

    // Optionally join a global broadcast room
    socket.join('broadcast');

    socket.on('disconnect', () => {
      console.log(`User disconnected from socket: ${user.userId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};

export const emitToUser = (userId: string, event: string, payload: any) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, payload);
  }
};
