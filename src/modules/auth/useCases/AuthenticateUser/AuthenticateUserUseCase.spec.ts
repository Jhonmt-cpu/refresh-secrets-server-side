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
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase';

let dateProvider: IDateProvider;
let generateTokenProvider: IGenerateTokenProvider;
let generateRefreshTokenProvider: IGenerateRefreshTokenProvider;
let refreshTokensRepository: IRefreshTokensRepository;
let usersRepository: IUsersRepository;
let tokenCacheProvider: ITokenCacheProvider;

let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe('Authenticate User', () => {
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
  });

  it('should be able to authenticate an user', async () => {
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

    expect(userAuthenticated).toHaveProperty('token');
    expect(userAuthenticated).toHaveProperty('refresh_token');
  });

  it('should not be able to authenticate a non existing user', async () => {
    const user = {
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: '123456',
    };

    await createUserUseCase.execute(user);

    await expect(
      authenticateUserUseCase.execute({
        email: user.email + 'wrong email',
        password: user.password,
      }),
    ).rejects.toEqual(new AppError('Email or password incorrect.'));
  });

  it('should not be able to authenticate a user with wrong password', async () => {
    const user = {
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: '123456',
    };

    await createUserUseCase.execute(user);

    await expect(
      authenticateUserUseCase.execute({
        email: user.email,
        password: user.password + 'wrong password',
      }),
    ).rejects.toEqual(new AppError('Email or password incorrect.'));
  });
});
