import { v4 as uuid } from 'uuid';

import { IDateProvider } from '../../../../shared/container/providers/DateProvider/IDateProvider';
import { DayJsDateProvider } from '../../../../shared/container/providers/DateProvider/implementations/DayjsDateProvider';
import { ITokenCacheProvider } from '../../../../shared/container/providers/TokenCacheProvider/ITokenCacheProvider';
import { InMemoryTokenCacheProvider } from '../../../../shared/container/providers/TokenCacheProvider/implementations/InMemoryTokenCacheProvider';
import { AppError } from '../../../../shared/errors/AppError';
import { IUsersRepository } from '../../../users/repositories/IUsersRepository';
import { UsersRepositoryInMemory } from '../../../users/repositories/inMemory/UsersRepositoryInMemory';
import { CreateUserUseCase } from '../../../users/useCases/CreateUser/CreateUserUseCase';
import { GenerateRefreshTokenProvider } from '../../providers/GenerateRefreshTokenProvider/GenerateRefreshTokenProvider';
import { IGenerateRefreshTokenProvider } from '../../providers/GenerateRefreshTokenProvider/IGenerateRefreshTokenProvider';
import { GenerateTokenProvider } from '../../providers/GenerateTokenProvider/GenerateTokenProvider';
import { IGenerateTokenProvider } from '../../providers/GenerateTokenProvider/IGenerateTokenProvider';
import { IRefreshTokensRepository } from '../../repositories/IRefreshTokensRepository';
import { RefreshTokensRepositoryInMemory } from '../../repositories/inMemory/RefreshTokensRepositoyInMemory';
import { AuthenticateUserUseCase } from '../AuthenticateUser/AuthenticateUserUseCase';
import { RefreshTokenUseCase } from './RefreshTokenUseCase';

let dateProvider: IDateProvider;
let generateTokenProvider: IGenerateTokenProvider;
let generateRefreshTokenProvider: IGenerateRefreshTokenProvider;
let refreshTokensRepository: IRefreshTokensRepository;
let usersRepository: IUsersRepository;
let tokenCacheProvider: ITokenCacheProvider;

let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let refreshTokenUseCase: RefreshTokenUseCase;

describe('Refresh token', () => {
  beforeEach(() => {
    dateProvider = new DayJsDateProvider();
    generateRefreshTokenProvider = new GenerateRefreshTokenProvider(
      dateProvider,
    );
    generateTokenProvider = new GenerateTokenProvider();
    refreshTokensRepository = new RefreshTokensRepositoryInMemory();
    usersRepository = new UsersRepositoryInMemory();
    tokenCacheProvider = new InMemoryTokenCacheProvider(dateProvider);

    createUserUseCase = new CreateUserUseCase(usersRepository);

    authenticateUserUseCase = new AuthenticateUserUseCase(
      generateTokenProvider,
      generateRefreshTokenProvider,
      refreshTokensRepository,
      usersRepository,
      tokenCacheProvider,
    );

    refreshTokenUseCase = new RefreshTokenUseCase(
      refreshTokensRepository,
      tokenCacheProvider,
      generateTokenProvider,
      generateRefreshTokenProvider,
    );
  });

  it('should be able to refresh an user token', async () => {
    const user = {
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: '123456',
    };

    await createUserUseCase.execute(user);

    const userAuthenticated = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    const refreshToken = await refreshTokenUseCase.execute(
      userAuthenticated.refresh_token,
    );

    expect(refreshToken).toHaveProperty('token');
    expect(refreshToken).toHaveProperty('refresh_token');
    expect(refreshToken.refresh_token).not.toEqual(
      userAuthenticated.refresh_token,
    );
  });

  it('should not be able to refresh a non existing refresh token', async () => {
    const user = {
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: '123456',
    };

    await createUserUseCase.execute(user);

    await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    await expect(refreshTokenUseCase.execute(uuid())).rejects.toEqual(
      new AppError('Refresh token invalid.'),
    );
  });

  it('should not be able to refresh a expired refresh token', async () => {
    const user = {
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: '123456',
    };

    const userCreated = await createUserUseCase.execute(user);

    const token = uuid();

    tokenCacheProvider.tokenCacheSet({
      key: token,
      value: userCreated.user_id.toString(),
      expireTime: -1,
    });

    await expect(refreshTokenUseCase.execute(token)).rejects.toEqual(
      new AppError('Refresh token invalid.'),
    );
  });
});
