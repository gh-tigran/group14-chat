import HttpError from 'http-errors';
import { Messages, Users } from '../models';
import Socket from '../services/Socket';

class MessagesController {
  static send = async (req, res, next) => {
    try {
      const { userId } = req;
      const { text, friendId } = req.body;
      const { id } = await Messages.create({
        text,
        from: userId,
        to: friendId,
      });
      const message = await Messages.findOne({
        where: {
          id,
        },
        include: [{
          model: Users,
          as: 'userFrom',
          required: true,
        }, {
          model: Users,
          as: 'userTo',
          required: true,
        }],
      });
      Socket.emit(friendId, 'newMessage', message);

      res.json({
        status: 'ok',
        message,
        a,
      });
    } catch (e) {
      next(e);
    }
  };

  static list = async (req, res, next) => {
    try {
      const { userId } = req;
      const { page = 1 } = req.query;
      const { friendId } = req.params;

      const messages = await Messages.findAll({
        where: {
          $or: [
            { from: userId, to: friendId },
            { from: friendId, to: userId },
          ],
        },
        include: [{
          model: Users,
          as: 'userFrom',
          required: true,
        }, {
          model: Users,
          as: 'userTo',
          required: true,
        }],
        order: [['createdAt', 'desc']],
        limit: 20,
        offset: (page - 1) * 20,
      });

      res.json({
        status: 'ok',
        messages,
      });
    } catch (e) {
      next(e);
    }
  };

  static open = async (req, res, next) => {
    try {
      const { userId } = req;
      const { messageId } = req.body;

      const message = await Messages.findOne({
        where: {
          id: messageId,
          to: userId,
        },
      });
      if (!message) {
        throw HttpError(404);
      }

      Socket.emit(message.from, 'messageOpen', message);

      message.seen = new Date();
      await message.save();

      res.json({
        status: 'ok',
      });
    } catch (e) {
      next(e);
    }
  };
}

export default MessagesController;
