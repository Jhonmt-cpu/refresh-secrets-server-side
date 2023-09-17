import { Request, Response, NextFunction } from 'express';
import {
  redisRateLimiterGet,
  redisRateLimiterSet,
} from '../../../../utils/redis-rate-limiter';
import rateLimiterResources from '../../../../config/rateLimiterResources';
import { AppError } from '../../../errors/AppError';

export default async function rateLimiter(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { ip, url, method } = request;

    const key = `${ip}:${url}:${method}}`;

    const currentRequests = Number((await redisRateLimiterGet(key)) || 0) + 1;

    await redisRateLimiterSet({
      key,
      value: currentRequests.toString(),
      expireTime: 60,
    });

    let maxRequestsPerMinute = 5;

    const routeOptions = rateLimiterResources[url];

    if (routeOptions) {
      const maxRequestsForRoute = routeOptions[method];

      if (maxRequestsForRoute) {
        maxRequestsPerMinute = maxRequestsForRoute;
      }
    }

    if (currentRequests > maxRequestsPerMinute) {
      throw new AppError('Too many requests', 429);
    }

    return next();
  } catch (err) {
    throw new AppError('Too many requests', 429);
  }
}
