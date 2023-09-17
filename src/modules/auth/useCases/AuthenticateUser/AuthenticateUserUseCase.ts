import { compare } from 'bcryptjs';
import { inject, injectable } from 'tsyringe';
import { AppError } from '../../../../shared/errors/AppError';
import { IUsersRepository } from '../../../users/repositories/IUsersRepository';
import { AuthenticateUserDTO } from '../../dtos/IAuthenticateUserDTO';
import { IGenerateRefreshTokenProvider } from '../../providers/GenerateRefreshTokenProvider/IGenerateRefreshTokenProvider';
import { IGenerateTokenProvider } from '../../providers/GenerateTokenProvider/IGenerateTokenProvider';
import { IRefreshTokensRepository } from '../../repositories/IRefreshTokensRepository';
import { ITokenCacheProvider } from '../../../../shared/container/providers/TokenCacheProvider/ITokenCacheProvider';

@injectable()
class AuthenticateUserUseCase {
  constructor(
    @inject('GenerateTokenProvider')
    private generateTokenProvider: IGenerateTokenProvider,
    @inject('GenerateRefreshTokenProvider')
    private generateRefreshTokenProvider: IGenerateRefreshTokenProvider,
    @inject('RefreshTokensRepository')
    private refreshTokensRepository: IRefreshTokensRepository,
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
    @inject('TokenCacheProvider')
    private tokenCacheProvider: ITokenCacheProvider,
  ) {}

  async execute({ email, password }: AuthenticateUserDTO) {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new AppError('Email or password incorrect.');
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new AppError('Email or password incorrect.');
    }

    const token = this.generateTokenProvider.generateToken(user.user_id);

    const refresh_token =
      this.generateRefreshTokenProvider.generateRefreshToken(user.user_id);

    await this.refreshTokensRepository.deleteAllByUserId(user.user_id);

    await this.refreshTokensRepository.create(refresh_token);

    await this.tokenCacheProvider.tokenCacheDeleteAllByPrefix(
      user.user_id.toString(),
    );

    const expiresInSeconds =
      Number(process.env.JWT_REFRESH_EXPIRES_IN) * 24 * 60 * 60;

    const tokenWithUserId = `${user.user_id}:${refresh_token.refresh_token}`;

    await this.tokenCacheProvider.tokenCacheSet({
      key: tokenWithUserId,
      value: 'false',
      expireTime: expiresInSeconds,
    });

    return {
      name: user.name,
      email: user.email,
      token,
      refresh_token: tokenWithUserId,
    };
  }
}

export { AuthenticateUserUseCase };
