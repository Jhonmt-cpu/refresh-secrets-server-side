import { container } from 'tsyringe';
import { GenerateTokenProvider } from './GenerateTokenProvider/GenerateTokenProvider';
import { GenerateRefreshTokenProvider } from './GenerateRefreshTokenProvider/GenerateRefreshTokenProvider';
import { IGenerateTokenProvider } from './GenerateTokenProvider/IGenerateTokenProvider';
import { IGenerateRefreshTokenProvider } from './GenerateRefreshTokenProvider/IGenerateRefreshTokenProvider';

container.registerSingleton<IGenerateTokenProvider>(
  'GenerateTokenProvider',
  GenerateTokenProvider,
);

container.registerSingleton<IGenerateRefreshTokenProvider>(
  'GenerateRefreshTokenProvider',
  GenerateRefreshTokenProvider,
);
