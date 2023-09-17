import { IGenerateRefreshTokenProvider } from './IGenerateRefreshTokenProvider';
import { RefreshTokenEntity } from '../../infra/typeorm/entities/RefreshTokenEntity';
import auth from '../../../../config/auth';
import { inject, injectable } from 'tsyringe';
import { IDateProvider } from '../../../../shared/container/providers/DateProvider/IDateProvider';

@injectable()
class GenerateRefreshTokenProvider implements IGenerateRefreshTokenProvider {
  constructor(
    @inject('DateProvider')
    private dateProvider: IDateProvider,
  ) {}

  generateRefreshToken(user_id: number): RefreshTokenEntity {
    const expiresInDays = Number(auth.refresh.expiresIn);

    const expiresIn = this.dateProvider.addDays(expiresInDays);

    const refreshToken = new RefreshTokenEntity();

    Object.assign(refreshToken, {
      user_id,
      expires_in: expiresIn,
    });

    return refreshToken;
  }
}

export { GenerateRefreshTokenProvider };
