import { RefreshTokenEntity } from '../../infra/typeorm/entities/RefreshTokenEntity';
import {
  IRefreshTokensRepository,
  IUpdateNextToken,
} from '../IRefreshTokensRepository';

class RefreshTokensRepositoryInMemory implements IRefreshTokensRepository {
  private refreshTokens: RefreshTokenEntity[] = [];

  async findById(refresh_token: string): Promise<RefreshTokenEntity | null> {
    const refreshToken = this.refreshTokens.find(
      (refreshToken) => refreshToken.refresh_token === refresh_token,
    );

    return refreshToken || null;
  }

  async create(refreshToken: RefreshTokenEntity): Promise<RefreshTokenEntity> {
    this.refreshTokens.push(refreshToken);

    return refreshToken;
  }

  async updateNextToken({
    refresh_token,
    next_token,
  }: IUpdateNextToken): Promise<void> {
    const index = this.refreshTokens.findIndex(
      (refreshToken) => refreshToken.refresh_token === refresh_token,
    );

    this.refreshTokens[index].next_token = next_token;
  }

  async findLastUserTokens(): Promise<RefreshTokenEntity[]> {
    const tokens = this.refreshTokens.filter(
      (refreshToken) =>
        refreshToken.next_token === undefined &&
        refreshToken.expires_in > new Date(),
    );

    return tokens;
  }

  async deleteAllByUserId(user_id: number): Promise<void> {
    this.refreshTokens = this.refreshTokens.filter(
      (refreshToken) => refreshToken.user_id !== user_id,
    );
  }

  async deleteExpiredTokens(): Promise<void> {
    this.refreshTokens = this.refreshTokens.filter(
      (refreshToken) => refreshToken.expires_in > new Date(),
    );
  }

  async findAll(): Promise<RefreshTokenEntity[]> {
    return this.refreshTokens;
  }
}

export { RefreshTokensRepositoryInMemory };
