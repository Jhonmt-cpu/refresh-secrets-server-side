import Redis from 'ioredis';
import { ICacheSet, ITokenCacheProvider } from '../ITokenCacheProvider';

class RedisTokenCacheProvider implements ITokenCacheProvider {
  private redisClient = new Redis({
    password: process.env.REDIS_TOKEN_CACHE_PASSWORD,
    host:
      process.env.NODE_ENV === 'test'
        ? process.env.REDIS_TOKEN_CACHE_HOST_TEST
        : process.env.REDIS_TOKEN_CACHE_HOST,
    port: Number(
      process.env.NODE_ENV === 'test'
        ? process.env.REDIS_TOKEN_CACHE_PORT_TEST
        : process.env.REDIS_TOKEN_CACHE_PORT,
    ),
    username: process.env.REDIS_TOKEN_CACHE_USER,
  });

  async tokenCacheSet({ key, value, expireTime }: ICacheSet): Promise<void> {
    await this.redisClient.set(key, value, 'EX', expireTime);
  }

  async tokenCacheSetKeepTTL({ key, value }: ICacheSet): Promise<void> {
    await this.redisClient.set(key, value, 'KEEPTTL');
  }

  async tokenCacheGet(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  async tokenCacheDel(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async tokenCacheFlushAll(): Promise<void> {
    await this.redisClient.flushall();
  }

  async tokenCacheMultipleSet(refreshTokens: ICacheSet[]): Promise<void> {
    const pipeline = this.redisClient.pipeline();

    refreshTokens.forEach((refreshToken) => {
      pipeline.set(
        refreshToken.key,
        refreshToken.value,
        'EX',
        refreshToken.expireTime,
      );
    });

    await pipeline.exec();
  }

  async tokenCacheDeleteAllByPrefix(prefix: string): Promise<void> {
    const keys = await this.redisClient.keys(`${prefix}:*`);

    const pipeline = this.redisClient.pipeline();

    keys.forEach((key) => {
      pipeline.del(key);
    });

    await pipeline.exec();
  }

  async tokenCacheGetAllByPrefix(prefix: string): Promise<string[]> {
    const keys = await this.redisClient.keys(`${prefix}:*`);

    return keys;
  }

  async tokenCacheDeleteAllBySuffix(suffix: string): Promise<void> {
    const keys = await this.redisClient.keys(`*:${suffix}`);

    const pipeline = this.redisClient.pipeline();

    keys.forEach((key) => {
      pipeline.del(key);
    });

    await pipeline.exec();
  }
}

export { RedisTokenCacheProvider };
