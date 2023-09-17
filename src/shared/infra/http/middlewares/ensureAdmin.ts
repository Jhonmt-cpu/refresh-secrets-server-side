import { NextFunction, Request, Response } from 'express';
import { IUsersRepository } from '../../../../modules/users/repositories/IUsersRepository';
import { UsersRepositoryInMemory } from '../../../../modules/users/repositories/inMemory/UsersRepositoryInMemory';
import { UsersRepository } from '../../../../modules/users/infra/typeorm/repositories/UsersRepository';
import { AppError } from '../../../errors/AppError';

export async function ensureAdmin(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const usersRepository: IUsersRepository =
    process.env.NODE_ENV === 'test'
      ? new UsersRepositoryInMemory()
      : new UsersRepository();

  const userId = request.user.id;

  const user = await usersRepository.findById(Number(userId));

  if (!user) {
    throw new AppError('Resource not allowed', 403);
  }

  if (!user.is_admin) {
    throw new AppError('Resource not allowed', 403);
  }

  return next();
}
