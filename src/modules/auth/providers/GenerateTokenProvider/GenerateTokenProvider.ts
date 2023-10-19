import { sign } from 'jsonwebtoken';
import auth from '../../../../config/auth';
import {
  IGenerateTokenProvider,
  IGenerateToken,
} from './IGenerateTokenProvider';
import { inject, injectable } from 'tsyringe';
import { IEncryptAndDecryptProvider } from '../EncryptAndDecryptProvider/IEncryptAndDecryptProvider';

@injectable()
class GenerateTokenProvider implements IGenerateTokenProvider {
  constructor(
    @inject('EncryptAndDecryptProvider')
    private encryptAndDecryptProvider: IEncryptAndDecryptProvider,
  ) {}

  async generateToken({ userId, sessionId }: IGenerateToken): Promise<string> {
    const subject = await this.encryptAndDecryptProvider.encrypt(
      JSON.stringify({ sessionId }),
    );

    const token = sign(
      {
        userId,
      },
      auth.jwt.jwtSecret,
      {
        subject: subject,
        expiresIn: auth.jwt.expiresIn,
      },
    );

    return token;
  }
}

export { GenerateTokenProvider };
