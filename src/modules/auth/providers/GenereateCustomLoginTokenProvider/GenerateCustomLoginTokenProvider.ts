import { inject, injectable } from 'tsyringe';
import {
  IGenerateCustomLoginToken,
  IGenerateCustomLoginTokenProvider,
} from './IGenerateCustomLoginTokenProvider';
import { IEncryptAndDecryptProvider } from '../EncryptAndDecryptProvider/IEncryptAndDecryptProvider';
import { sign } from 'jsonwebtoken';
import auth from '../../../../config/auth';

@injectable()
class GenerateCustomLoginTokenProvider
  implements IGenerateCustomLoginTokenProvider
{
  constructor(
    @inject('EncryptAndDecryptProvider')
    private encryptAndDecryptProvider: IEncryptAndDecryptProvider,
  ) {}

  async generateToken({
    userId,
    sessionId,
  }: IGenerateCustomLoginToken): Promise<string> {
    const subject = await this.encryptAndDecryptProvider.encrypt(
      JSON.stringify({ sessionId }),
    );

    const token = sign(
      {
        userId,
      },
      auth.custom_login_token.jwtSecret,
      {
        subject: subject,
        expiresIn: auth.custom_login_token.expiresIn,
      },
    );

    return token;
  }
}

export { GenerateCustomLoginTokenProvider };
