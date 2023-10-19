import { compare } from 'bcryptjs';
import { inject, injectable } from 'tsyringe';
import { AppError } from '../../../../shared/errors/AppError';
import { IUsersRepository } from '../../../users/repositories/IUsersRepository';
import { IGenerateTokenProvider } from '../../providers/GenerateTokenProvider/IGenerateTokenProvider';
import { ITokenCacheProvider } from '../../../../shared/container/providers/TokenCacheProvider/ITokenCacheProvider';
import { AuthenticateUserDTO } from '../../dtos/IAuthenticateUserDTO';
import auth from '../../../../config/auth';

@injectable()
class AuthenticateUserUseCase {
  constructor(
    @inject('GenerateTokenProvider')
    private generateTokenProvider: IGenerateTokenProvider,
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
    @inject('TokenCacheProvider')
    private tokenCacheProvider: ITokenCacheProvider,
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

    const token = await this.generateTokenProvider.generateToken({
      userId: user.user_id,
      sessionId: sessionId,
    });

    const expiresInSeconds = Number(auth.jwt.expiresInMinutes) * 60;

    await this.tokenCacheProvider.tokenCacheSet({
      key: sessionId,
      value: user.user_id.toString(),
      expireTime: expiresInSeconds,
    });

    return {
      name: user.name,
      email: user.email,
      token,
    };
  }
}

export { AuthenticateUserUseCase };
