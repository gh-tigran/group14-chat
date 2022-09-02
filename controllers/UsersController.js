import HttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { Sequelize } from 'sequelize';
import { Users } from '../models';

const { JWT_SECRET } = process.env;

class UsersController {
  static register = async (req, res, next) => {
    try {
      const {
        firstName, lastName, email, password,
      } = req.body;
      const exists = await Users.findOne({
        where: { email },
      });
      if (exists) {
        throw HttpError(422, { errors: { email: 'Already Exists' } });
      }
      const user = await Users.create({
        firstName,
        lastName,
        email,
        password,
        status: 'active',
      });
      res.json({
        status: 'ok',
        user,
      });
    } catch (e) {
      next(e);
    }
  };

  static login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await Users.findOne({
        where: {
          email,
          password: Users.passHash(password),
        },
      });
      if (!user) {
        throw HttpError(403, 'Invalid email or password');
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      res.json({
        status: 'ok',
        user,
        token,
      });
    } catch (e) {
      next(e);
    }
  };

  static list = async (req, res, next) => {
    try {
      const { page = 1, s = '' } = req.query;
      const where = {
        status: 'active',
      };
      if (s) {
        where.$or = [
          { firstName: { $like: `%${s}%` } },
          { lastName: { $like: `%${s}%` } },
          { email: { $like: `%${s}%` } },
          Sequelize.where(Sequelize.literal('CONCAT(firstName, \' \', lastName)'), { $like: `%${s}%` }),
          Sequelize.where(Sequelize.literal('CONCAT(lastName, \' \', firstName)'), { $like: `%${s}%` }),
        ];
      }
      const users = await Users.findAll({
        where,
        limit: 20,
        offset: (page - 1) * 20,
      });
      res.json({
        status: 'ok',
        users,
      });
    } catch (e) {
      next(e);
    }
  };

  static profile = async (req, res, next) => {
    try {
      const userId = req.params.userId || req.userId;
      const user = await Users.findOne({
        where: {
          id: userId,
        },
      });
      res.json({
        status: 'ok',
        user,
      });
    } catch (e) {
      next(e);
    }
  };
}

export default UsersController;
