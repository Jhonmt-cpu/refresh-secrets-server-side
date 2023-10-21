import * as jwt from 'jsonwebtoken';
import { inject, injectable } from 'tsyringe';
import { AppError } from '../../../../shared/errors/AppError';
import { IUsersRepository } from '../../../users/repositories/IUsersRepository';
import { IGenerateTokenProvider } from '../../providers/GenerateTokenProvider/IGenerateTokenProvider';
import { ITokenCacheProvider } from '../../../../shared/container/providers/TokenCacheProvider/ITokenCacheProvider';
import auth from '../../../../config/auth';
import { IEncryptAndDecryptProvider } from '../../providers/EncryptAndDecryptProvider/IEncryptAndDecryptProvider';
import { LoginByCustomTokenDTO } from '../../dtos/iLoginByCustomTokenDTO';
import { LoginStatus } from '../../dtos/IAuthenticateUserResponseDTO';

@injectable()
class LoginByCustomTokenUseCase {
  constructor(
    @inject('GenerateTokenProvider')
    private generateTokenProvider: IGenerateTokenProvider,
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
    @inject('TokenCacheProvider')
    private tokenCacheProvider: ITokenCacheProvider,
    @inject('EncryptAndDecryptProvider')
    private encryptAndDecryptProvider: IEncryptAndDecryptProvider,
  ) {}

  async execute({ customLoginToken, sessionId }: LoginByCustomTokenDTO) {
    let tokenVerified: jwt.UserIDJwtPayload;

    try {
      tokenVerified = <jwt.UserIDJwtPayload>(
        jwt.verify(customLoginToken, auth.custom_login_token.jwtSecret)
      );
    } catch (error) {
      throw new AppError('Invalid token.');
    }

    const subject = await this.encryptAndDecryptProvider.decrypt(
      tokenVerified.sub as string,
    );

    const tokenSecretData = JSON.parse(subject);

    const { sessionId: tokenSessionId } = tokenSecretData;

    if (sessionId !== tokenSessionId) {
      throw new AppError('Invalid token.');
    }

    const user = await this.usersRepository.findById(tokenVerified.userId);

    if (!user) {
      throw new AppError('Invalid user,');
    }

    await this.tokenCacheProvider.tokenCacheDeleteAllByPrefix(
      user.user_id.toString(),
    );

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

export { LoginByCustomTokenUseCase };
