import { container } from 'tsyringe';

import './providers';

import '../../modules/auth/providers';

import { UsersRepository } from '../../modules/users/infra/typeorm/repositories/UsersRepository';
import { IUsersRepository } from '../../modules/users/repositories/IUsersRepository';

container.registerSingleton<IUsersRepository>(
  'UsersRepository',
  UsersRepository,
);
