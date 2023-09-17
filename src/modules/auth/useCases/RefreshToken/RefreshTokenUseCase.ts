import { inject, injectable } from 'tsyringe';
import { AppError } from '../../../../shared/errors/AppError';
import { RefreshTokenEntity } from '../../infra/typeorm/entities/RefreshTokenEntity';
import { IRefreshTokensRepository } from '../../repositories/IRefreshTokensRepository';
import { ITokenCacheProvider } from '../../../../shared/container/providers/TokenCacheProvider/ITokenCacheProvider';
import { IGenerateTokenProvider } from '../../providers/GenerateTokenProvider/IGenerateTokenProvider';
import { IGenerateRefreshTokenProvider } from '../../providers/GenerateRefreshTokenProvider/IGenerateRefreshTokenProvider';
import auth from '../../../../config/auth';

@injectable()
class RefreshTokenUseCase {
  constructor(
    @inject('RefreshTokensRepository')
    private refreshTokensRepository: IRefreshTokensRepository,
    @inject('TokenCacheProvider')
    private tokenCacheProvider: ITokenCacheProvider,
    @inject('GenerateTokenProvider')
    private generateTokenProvider: IGenerateTokenProvider,
    @inject('GenerateRefreshTokenProvider')
    private generateRefreshTokenProvider: IGenerateRefreshTokenProvider,
  ) {}

  async execute(refreshToken: string) {
    const refreshTokenExists = await this.tokenCacheProvider.tokenCacheGet(
      refreshToken,
    );

    if (!refreshTokenExists) {
      throw new AppError('Refresh token invalid.');
    }

    const [userId, refresh_token_splitted] = refreshToken.split(':');

    if (refreshTokenExists === 'true') {
      this.tokenCacheProvider.tokenCacheDeleteAllByPrefix(userId);

      throw new AppError('Refresh token already used.');
    }

    const userIdNumber = Number(userId);

    const refresh_token =
      this.generateRefreshTokenProvider.generateRefreshToken(userIdNumber);

    this.insertNewToken(refresh_token, refresh_token_splitted);

    const tokenWithUserId = `${userId}:${refresh_token.refresh_token}`;

    await this.tokenCacheProvider.tokenCacheSetKeepTTL({
      key: refreshToken,
      value: 'true',
    });

    const expiresInDays = Number(auth.refresh.expiresIn);

    await this.tokenCacheProvider.tokenCacheSet({
      key: tokenWithUserId,
      value: 'false',
      expireTime: expiresInDays * 24 * 60 * 60,
    });

    const token = this.generateTokenProvider.generateToken(userIdNumber);

    return {
      token,
      refresh_token: tokenWithUserId,
    };
  }

  async insertNewToken(refreshToken: RefreshTokenEntity, token: string) {
    await this.refreshTokensRepository.create(refreshToken);

    this.refreshTokensRepository.updateNextToken({
      refresh_token: token,
      next_token: refreshToken.refresh_token,
    });
  }
}

export { RefreshTokenUseCase };
