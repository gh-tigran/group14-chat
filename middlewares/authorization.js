import jwt from "jsonwebtoken";
import HttpError from "http-errors";

const { JWT_SECRET } = process.env;

const EXCLUDE = [
  'POST:/users/login',
  'POST:/users/register'
]

const authorization = async (req, res, next) => {
  try {
    const { authorization = '' } = req.headers;
    const { path, method } = req;
    if (EXCLUDE.some(e => e.startsWith(method + ':' + path))) {
      next();
      return;
    }

    let userId;
    try {
      const d = jwt.verify(authorization.replace('Bearer ', ''), JWT_SECRET)
      userId = d.userId;
    } catch (e) {
      //
    }

    if (!userId) {
      throw HttpError(401);
    }
    req.userId = userId;
    next();
  } catch (e) {
    next(e);
  }
}

export default authorization;
