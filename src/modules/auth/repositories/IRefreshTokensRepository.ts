import { RefreshTokenEntity } from '../infra/typeorm/entities/RefreshTokenEntity';

interface IUpdateNextToken {
  refresh_token: string;
  next_token: string;
}

interface IRefreshTokensRepository {
  findById(refresh_token: string): Promise<RefreshTokenEntity | null>;
  create(refreshToken: RefreshTokenEntity): Promise<RefreshTokenEntity>;
  updateNextToken({
    refresh_token,
    next_token,
  }: IUpdateNextToken): Promise<void>;
  findLastUserTokens(): Promise<RefreshTokenEntity[]>;
  findAll(): Promise<RefreshTokenEntity[]>;
  deleteAllByUserId(user_id: number): Promise<void>;
  deleteExpiredTokens(): Promise<void>;
}

export { IRefreshTokensRepository, IUpdateNextToken };
