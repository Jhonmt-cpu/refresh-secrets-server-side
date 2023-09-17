import { sign } from 'jsonwebtoken';
import auth from '../../../../config/auth';
import { IGenerateTokenProvider } from './IGenerateTokenProvider';

class GenerateTokenProvider implements IGenerateTokenProvider {
  generateToken(userId: number): string {
    const token = sign({}, auth.jwt.jwtSecret, {
      subject: String(userId),
      expiresIn: auth.jwt.expiresIn,
    });

    return token;
  }
}

export { GenerateTokenProvider };
