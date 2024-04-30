import {
  redisRateLimiterGet,
  redisRateLimiterSet,
} from '../../../../utils/redis-rate-limiter';
import { rateLimiterSocketIOResources } from '../../../../config/rateLimiterResources';
import { AppError } from '../../../errors/AppError';

export default async function rateLimiterSocketIO(
  sessionId: string,
  event: string,
): Promise<void> {
  try {
    const key = `${sessionId}:${event}`;
    //#region
    const currentRequests = Number((await redisRateLimiterGet(key)) || 0) + 1;

    await redisRateLimiterSet({
      key,
      value: currentRequests.toString(),
      expireTime: 60,
    });
    //#endregion
    let maxRequestsPerMinute = 5;

    const eventOptions = rateLimiterSocketIOResources[event];

    if (eventOptions) {
      const maxRequestsForRoute = eventOptions;

      if (maxRequestsForRoute) {
        maxRequestsPerMinute = maxRequestsForRoute;
      }
    }

    if (currentRequests > maxRequestsPerMinute) {
      throw new AppError('Too many requests', 429);
    }
  } catch (err) {
    throw new AppError('Too many requests', 429);
  }
}
