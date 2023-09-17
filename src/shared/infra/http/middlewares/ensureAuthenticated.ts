import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { AppError } from '../../../errors/AppError';
import auth from '../../../../config/auth';

export function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const authToken = request.headers.authorization;

  if (!authToken) {
    return response.status(401).json({
      massage: 'Token missing',
    });
  }

  const [, token] = authToken.split(' ');

  try {
    const tokenVerified = verify(token, auth.jwt.jwtSecret);

    request.user = {
      id: tokenVerified.sub as string,
    };

    return next();
  } catch (err) {
    throw new AppError('Invalid token', 401);
  }
}
