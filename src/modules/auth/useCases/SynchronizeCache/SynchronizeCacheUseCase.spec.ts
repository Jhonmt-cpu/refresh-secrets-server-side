import { v4 as uuid } from 'uuid';

import { ITokenCacheProvider } from '../../../../shared/container/providers/TokenCacheProvider/ITokenCacheProvider';
import { InMemoryTokenCacheProvider } from '../../../../shared/container/providers/TokenCacheProvider/implementations/InMemoryTokenCacheProvider';
import { IRefreshTokensRepository } from '../../repositories/IRefreshTokensRepository';
import { RefreshTokensRepositoryInMemory } from '../../repositories/inMemory/RefreshTokensRepositoyInMemory';
import { SynchronizeCacheUseCase } from './SynchronizeCacheUseCase';
import { IDateProvider } from '../../../../shared/container/providers/DateProvider/IDateProvider';
import { DayJsDateProvider } from '../../../../shared/container/providers/DateProvider/implementations/DayjsDateProvider';

let dateProvider: IDateProvider;
let refreshTokensRepository: IRefreshTokensRepository;
let tokenCacheProvider: ITokenCacheProvider;

let synchronizeCacheUseCase: SynchronizeCacheUseCase;

describe('Synchronize cache', () => {
  beforeEach(() => {
    dateProvider = new DayJsDateProvider();
    refreshTokensRepository = new RefreshTokensRepositoryInMemory();
    tokenCacheProvider = new InMemoryTokenCacheProvider(dateProvider);

    synchronizeCacheUseCase = new SynchronizeCacheUseCase(
      refreshTokensRepository,
      tokenCacheProvider,
      dateProvider,
    );
  });

  it('should be able to synchronize the cache', async () => {
    const user = {
      user_id: 1,
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: '12345678',
    };

    const user2 = {
      user_id: 2,
      name: 'John Doe 2',
      email: 'johndoe2@email.com',
      password: '12345678',
    };

    const user3 = {
      user_id: 3,
      name: 'John Doe 3',
      email: 'johndoe3@email.com',
      password: '12345678',
    };

    const refresh_token_used = uuid();

    const refresh_token_valid = uuid();

    const refresh_token_second_valid = uuid();

    const refresh_token_expired = uuid();

    const old_token_in_cache = uuid();

    await refreshTokensRepository.create({
      user_id: user.user_id,
      refresh_token: refresh_token_used,
      expires_in: dateProvider.addDays(30),
      next_token: refresh_token_valid,
    });

    await refreshTokensRepository.create({
      user_id: user.user_id,
      refresh_token: refresh_token_valid,
      expires_in: dateProvider.addDays(30),
    });

    await refreshTokensRepository.create({
      user_id: user2.user_id,
      refresh_token: refresh_token_second_valid,
      expires_in: dateProvider.addDays(30),
    });

    await refreshTokensRepository.create({
      user_id: user3.user_id,
      refresh_token: refresh_token_expired,
      expires_in: dateProvider.subtractDays(1),
    });

    await tokenCacheProvider.tokenCacheSet({
      key: `${user.user_id}:${old_token_in_cache}`,
      value: 'false',
      expireTime: dateProvider.diffSeconds(dateProvider.addDays(30)),
    });

    await synchronizeCacheUseCase.execute();

    const tokenCacheUsed = await tokenCacheProvider.tokenCacheGet(
      `${user.user_id}:${refresh_token_used}`,
    );

    const tokenCacheValid = await tokenCacheProvider.tokenCacheGet(
      `${user.user_id}:${refresh_token_valid}`,
    );

    const tokenCacheSecondValid = await tokenCacheProvider.tokenCacheGet(
      `${user2.user_id}:${refresh_token_second_valid}`,
    );

    const tokenCacheExpired = await tokenCacheProvider.tokenCacheGet(
      `${user3.user_id}:${refresh_token_expired}`,
    );

    const oldTokenInCache = await tokenCacheProvider.tokenCacheGet(
      `${user.user_id}:${old_token_in_cache}`,
    );

    const tokenExpiredDeleted = await refreshTokensRepository.findById(
      refresh_token_expired,
    );

    expect(tokenCacheUsed).toEqual('true');
    expect(tokenCacheValid).toEqual('false');
    expect(tokenCacheSecondValid).toEqual('false');
    expect(tokenCacheExpired).toEqual(null);
    expect(oldTokenInCache).toEqual(null);
    expect(tokenExpiredDeleted).toEqual(null);
  });
});
