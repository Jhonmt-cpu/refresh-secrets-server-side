import { RefreshTokenEntity } from '../../infra/typeorm/entities/RefreshTokenEntity';

interface IGenerateRefreshTokenProvider {
  generateRefreshToken(user_id: number): RefreshTokenEntity;
}

export { IGenerateRefreshTokenProvider };
