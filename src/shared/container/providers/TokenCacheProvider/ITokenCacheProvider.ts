interface ICacheSet {
  key: string;
  value: string;
  expireTime: number;
}

interface ITokenCacheProvider {
  tokenCacheSet({ key, value, expireTime }: ICacheSet): Promise<void>;
  tokenCacheSetKeepTTL({
    key,
    value,
  }: Omit<ICacheSet, 'expireTime'>): Promise<void>;
  tokenCacheGet(key: string): Promise<string | null>;
  tokenCacheDel(key: string): Promise<void>;
  tokenCacheFlushAll(): Promise<void>;
  tokenCacheMultipleSet(refreshTokens: ICacheSet[]): Promise<void>;
  tokenCacheDeleteAllByPrefix(prefix: string): Promise<void>;
}

export { ITokenCacheProvider, ICacheSet };
