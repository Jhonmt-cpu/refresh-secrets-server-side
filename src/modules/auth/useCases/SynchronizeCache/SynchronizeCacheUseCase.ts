import { inject, injectable } from 'tsyringe';
import { IRefreshTokensRepository } from '../../repositories/IRefreshTokensRepository';
import { ITokenCacheProvider } from '../../../../shared/container/providers/TokenCacheProvider/ITokenCacheProvider';
import { IDateProvider } from '../../../../shared/container/providers/DateProvider/IDateProvider';

@injectable()
class SynchronizeCacheUseCase {
  constructor(
    @inject('RefreshTokensRepository')
    private refreshTokensRepository: IRefreshTokensRepository,
    @inject('TokenCacheProvider')
    private tokenCacheProvider: ITokenCacheProvider,
    @inject('DateProvider')
    private dateProvider: IDateProvider,
  ) {}

  async execute() {
    await this.refreshTokensRepository.deleteExpiredTokens();

    const refreshTokens = await this.refreshTokensRepository.findAll();

    const refreshTokensToCache = refreshTokens.map((refreshToken) => {
      return {
        key: `${refreshToken.user_id}:${refreshToken.refresh_token}`,
        value: refreshToken.next_token ? 'true' : 'false',
        expireTime: this.dateProvider.diffSeconds(refreshToken.expires_in),
      };
    });

    await this.tokenCacheProvider.tokenCacheFlushAll();

    await this.tokenCacheProvider.tokenCacheMultipleSet(refreshTokensToCache);
  }
}

export { SynchronizeCacheUseCase };
