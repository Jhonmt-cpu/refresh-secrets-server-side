import { container } from 'tsyringe';

import './providers';

import '../../modules/auth/providers';

import { UsersRepository } from '../../modules/users/infra/typeorm/repositories/UsersRepository';
import { IUsersRepository } from '../../modules/users/repositories/IUsersRepository';
import { RefreshTokensRepository } from '../../modules/auth/infra/typeorm/repositories/RefreshTokensRepository';
import { IRefreshTokensRepository } from '../../modules/auth/repositories/IRefreshTokensRepository';

container.registerSingleton<IUsersRepository>(
  'UsersRepository',
  UsersRepository,
);

container.registerSingleton<IRefreshTokensRepository>(
  'RefreshTokensRepository',
  RefreshTokensRepository,
);
