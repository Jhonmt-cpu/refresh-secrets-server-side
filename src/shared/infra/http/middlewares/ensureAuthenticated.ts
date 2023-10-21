import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { AppError } from '../../../errors/AppError';
import auth from '../../../../config/auth';
import { IEncryptAndDecryptProvider } from '../../../../modules/auth/providers/EncryptAndDecryptProvider/IEncryptAndDecryptProvider';
import { EncryptAndDecryptProvider } from '../../../../modules/auth/providers/EncryptAndDecryptProvider/EncryptAndDecryptProvider';
import { ITokenCacheProvider } from '../../../container/providers/TokenCacheProvider/ITokenCacheProvider';
import { RedisTokenCacheProvider } from '../../../container/providers/TokenCacheProvider/implementations/RedisTokenCacheProvider';

declare module 'jsonwebtoken' {
  export interface UserIDJwtPayload extends jwt.JwtPayload {
    userId: number;
  }
}

class EnsureAuthenticated {
  private static encryptAndDecryptProvider: IEncryptAndDecryptProvider;
  private static tokenCacheProvider: ITokenCacheProvider;

  constructor() {
    if (!EnsureAuthenticated.encryptAndDecryptProvider) {
      EnsureAuthenticated.encryptAndDecryptProvider =
        new EncryptAndDecryptProvider();
    }

    if (!EnsureAuthenticated.tokenCacheProvider) {
      EnsureAuthenticated.tokenCacheProvider = new RedisTokenCacheProvider();
    }
  }

  public async handle(
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    const authToken = request.headers.authorization;

    if (!authToken) {
      return response.status(401).json({
        massage: 'Token missing',
      });
    }

    const [, token] = authToken.split(' ');

    try {
      const tokenVerified = <jwt.UserIDJwtPayload>jwt.verify(
        token,
        auth.jwt.jwtSecret,
        {
          ignoreExpiration: true,
        },
      );

      const tokenSecret =
        await EnsureAuthenticated.encryptAndDecryptProvider.decrypt(
          tokenVerified.sub as string,
        );

      const tokenSecretData = JSON.parse(tokenSecret);

      const { sessionId } = tokenSecretData;

      const tokenExists =
        await EnsureAuthenticated.tokenCacheProvider.tokenCacheGet(
          `${tokenVerified.userId}:${sessionId}`,
        );

      if (!tokenExists) {
        throw new AppError('Token session not found', 401);
      }

      EnsureAuthenticated.tokenCacheProvider.tokenCacheSet({
        key: `${tokenVerified.userId}:${sessionId}`,
        value: tokenExists,
        expireTime: Number(auth.jwt.expiresInMinutes) * 60,
      });

      request.user = {
        id: tokenVerified.userId,
      };

      return next();
    } catch (err) {
      console.log(err);
      throw new AppError('Invalid token', 401);
    }
  }
}

export { EnsureAuthenticated };
