import { Server as IoServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Users } from '../models';

const { JWT_SECRET } = process.env;

class Socket {
  static init = (server) => {
    this.io = new IoServer(server, {
      cors: '*',
    });

    this.io.on('connect', this.handleConnect);
  };

  static emit = (userId, ev, args) => {
    this.io.to(`user_${userId}`).emit(ev, args);
  };

  static handleConnect = async (client) => {
    try {
      const { authorization } = client.handshake.headers;
      const { userId, isAdmin } = jwt.verify(authorization.replace('Bearer ', ''), JWT_SECRET);

      // eslint-disable-next-line no-param-reassign
      client.userId = userId;

      if (isAdmin) {
        client.join('admin');
      }

      client.join(`user_${userId}`);

      client.on('typing', this.handleTyping(client));
      client.on('disconnect', this.handleDisconnect(client));

      this.io.emit('userActivityChange', {
        id: client.userId,
        isOnline: true,
      });

      Users.update({
        isOnline: true,
      }, {
        where: {
          id: client.userId,
        },
      }).catch(console.error);
    } catch (e) {
      console.log(e);
    }
  };

  static handleTyping = (client) => (data) => {
    const { friendId } = data;
    this.io.to(`user_${friendId}`).emit('friendTyping', { friendId: +client.userId });
  };

  static handleDisconnect = (client) => async () => {
    const now = new Date();
    this.io.emit('userActivityChange', {
      id: client.userId,
      isOnline: false,
      lastLogin: now,
    });
    await Users.update({
      isOnline: false,
      lastLogin: now,
    }, {
      where: {
        id: client.userId,
      },
    });
  };
}

export default Socket;
