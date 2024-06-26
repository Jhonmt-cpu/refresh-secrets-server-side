import { compare } from 'bcryptjs';
import { inject, injectable } from 'tsyringe';
import { AppError } from '../../../../shared/errors/AppError';
import { IUsersRepository } from '../../../users/repositories/IUsersRepository';
import { IGenerateTokenProvider } from '../../providers/GenerateTokenProvider/IGenerateTokenProvider';
import { ITokenCacheProvider } from '../../../../shared/container/providers/TokenCacheProvider/ITokenCacheProvider';
import { AuthenticateUserDTO } from '../../dtos/IAuthenticateUserDTO';
import auth from '../../../../config/auth';
import { IGenerateCustomLoginTokenProvider } from '../../providers/GenereateCustomLoginTokenProvider/IGenerateCustomLoginTokenProvider';
import { LoginStatus } from '../../dtos/IAuthenticateUserResponseDTO';

@injectable()
class AuthenticateUserUseCase {
  constructor(
    @inject('GenerateTokenProvider')
    private generateTokenProvider: IGenerateTokenProvider,
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
    @inject('TokenCacheProvider')
    private tokenCacheProvider: ITokenCacheProvider,
    @inject('GenerateCustomLoginTokenProvider')
    private generateCustomLoginTokenProvider: IGenerateCustomLoginTokenProvider,
  ) {}

  async execute({ email, password, sessionId }: AuthenticateUserDTO) {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new AppError('Email or password incorrect.');
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new AppError('Email or password incorrect.');
    }

    const sessions = await this.tokenCacheProvider.tokenCacheGetAllByPrefix(
      user.user_id.toString(),
    );

    if (sessions.length > 0) {
      const customTokenLogin =
        await this.generateCustomLoginTokenProvider.generateToken({
          userId: user.user_id,
          sessionId: sessionId,
        });

      return {
        name: user.name,
        email: user.email,
        token: customTokenLogin,
        status: LoginStatus.custom_token,
      };
    }

    const token = await this.generateTokenProvider.generateToken({
      userId: user.user_id,
      sessionId: sessionId,
    });

    const expiresInSeconds = Number(auth.jwt.expiresInMinutes) * 60;

    await this.tokenCacheProvider.tokenCacheSet({
      key: `${user.user_id}:${sessionId}`,
      value: user.user_id.toString(),
      expireTime: expiresInSeconds,
    });

    return {
      name: user.name,
      email: user.email,
      token,
      status: LoginStatus.login_success,
    };
  }
}

export { AuthenticateUserUseCase };
