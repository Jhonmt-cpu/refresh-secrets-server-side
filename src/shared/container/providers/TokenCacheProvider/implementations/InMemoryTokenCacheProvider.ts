import { IDateProvider } from '../../DateProvider/IDateProvider';
import { ICacheSet, ITokenCacheProvider } from '../ITokenCacheProvider';

interface IInMemoryToken {
  value: string;
  expireTime: Date;
}

class InMemoryTokenCacheProvider implements ITokenCacheProvider {
  constructor(private dateProvider: IDateProvider) {}

  private cache: Map<string, IInMemoryToken> = new Map();

  async tokenCacheSet({ key, value, expireTime }: ICacheSet): Promise<void> {
    const expireDate = this.dateProvider.addSeconds(expireTime);

    this.cache.set(key, {
      value,
      expireTime: expireDate,
    });
  }

  async tokenCacheSetKeepTTL({ key, value }: ICacheSet): Promise<void> {
    const token = this.cache.get(key);

    if (!token) {
      return;
    }

    this.cache.set(key, {
      value,
      expireTime: token.expireTime,
    });
  }

  async tokenCacheGet(key: string): Promise<string | null> {
    const token = this.cache.get(key);

    if (!token) {
      return null;
    }

    if (this.dateProvider.isBeforeNow(token.expireTime)) {
      this.cache.delete(key);
      return null;
    }

    return token.value;
  }

  async tokenCacheDel(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async tokenCacheFlushAll(): Promise<void> {
    this.cache.clear();
  }

  async tokenCacheMultipleSet(refreshTokens: ICacheSet[]): Promise<void> {
    refreshTokens.forEach((refreshToken) => {
      const { key, value, expireTime } = refreshToken;

      const expireDate = new Date();

      expireDate.setSeconds(expireDate.getSeconds() + expireTime);

      this.cache.set(key, {
        value,
        expireTime: expireDate,
      });
    });
  }

  async tokenCacheDeleteAllByPrefix(prefix: string): Promise<void> {
    const keys = Array.from(this.cache.keys());

    const keysToDelete = keys.filter((key) => key.startsWith(prefix));

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
    });
  }
}

export { InMemoryTokenCacheProvider };
