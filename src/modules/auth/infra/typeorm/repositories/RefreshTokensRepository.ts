import { IsNull, LessThan, MoreThan } from 'typeorm';
import { RefreshTokenEntity } from '../entities/RefreshTokenEntity';
import { AppDataSource } from '../../../../../shared/infra/database/AppDataSource';
import {
  IRefreshTokensRepository,
  IUpdateNextToken,
} from '../../../repositories/IRefreshTokensRepository';

class RefreshTokensRepository implements IRefreshTokensRepository {
  private repository = AppDataSource.getRepository(RefreshTokenEntity);

  async findById(refresh_token: string): Promise<RefreshTokenEntity | null> {
    const refreshToken = await this.repository.findOne({
      where: { refresh_token },
    });

    return refreshToken;
  }

  async findAll(): Promise<RefreshTokenEntity[]> {
    const refreshTokens = await this.repository.find();

    return refreshTokens;
  }

  async create(refreshToken: RefreshTokenEntity): Promise<RefreshTokenEntity> {
    await this.repository.insert(refreshToken);

    return refreshToken;
  }

  async updateNextToken({
    refresh_token,
    next_token,
  }: IUpdateNextToken): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(RefreshTokenEntity)
      .set({ next_token })
      .where('refresh_token = :refresh_token', { refresh_token })
      .execute();
  }

  async findLastUserTokens(): Promise<RefreshTokenEntity[]> {
    const refreshTokens = await this.repository.find({
      where: {
        next_token: IsNull(),
        expires_in: MoreThan(new Date()),
      },
    });

    return refreshTokens;
  }

  async deleteAllByUserId(user_id: number): Promise<void> {
    await this.repository.delete({ user_id });
  }

  async deleteExpiredTokens(): Promise<void> {
    await this.repository.delete({ expires_in: LessThan(new Date()) });
  }
}

export { RefreshTokensRepository };
