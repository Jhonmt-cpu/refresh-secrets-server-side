import Redis from 'ioredis';
import { ICacheSet } from '../shared/container/providers/TokenCacheProvider/ITokenCacheProvider';

const redisRateLimiterClient = new Redis({
  password: process.env.REDIS_CACHE_PASSWORD,
  host:
    process.env.NODE_ENV === 'test'
      ? process.env.REDIS_CACHE_HOST_TEST
      : process.env.REDIS_CACHE_HOST,
  username: process.env.REDIS_CACHE_USER,
  port: Number(
    process.env.NODE_ENV === 'test'
      ? process.env.REDIS_CACHE_PORT_TEST
      : process.env.REDIS_CACHE_PORT,
  ),
});

async function redisRateLimiterSet({ key, value, expireTime }: ICacheSet) {
  return await redisRateLimiterClient.set(key, value, 'EX', expireTime);
}

async function redisRateLimiterGet(key: string) {
  return await redisRateLimiterClient.get(key);
}

export { redisRateLimiterClient, redisRateLimiterSet, redisRateLimiterGet };
