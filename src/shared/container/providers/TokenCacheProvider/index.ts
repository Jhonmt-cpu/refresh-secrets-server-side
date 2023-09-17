import { container } from 'tsyringe';
import { RedisTokenCacheProvider } from './implementations/RedisTokenCacheProvider';
import { ITokenCacheProvider } from './ITokenCacheProvider';

container.registerSingleton<ITokenCacheProvider>(
  'TokenCacheProvider',
  RedisTokenCacheProvider,
);
