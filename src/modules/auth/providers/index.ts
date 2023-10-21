import { container } from 'tsyringe';
import { GenerateTokenProvider } from './GenerateTokenProvider/GenerateTokenProvider';
import { IGenerateTokenProvider } from './GenerateTokenProvider/IGenerateTokenProvider';
import { IEncryptAndDecryptProvider } from './EncryptAndDecryptProvider/IEncryptAndDecryptProvider';
import { EncryptAndDecryptProvider } from './EncryptAndDecryptProvider/EncryptAndDecryptProvider';
import { IGenerateCustomLoginTokenProvider } from './GenereateCustomLoginTokenProvider/IGenerateCustomLoginTokenProvider';
import { GenerateCustomLoginTokenProvider } from './GenereateCustomLoginTokenProvider/GenerateCustomLoginTokenProvider';

container.registerSingleton<IEncryptAndDecryptProvider>(
  'EncryptAndDecryptProvider',
  EncryptAndDecryptProvider,
);

container.registerSingleton<IGenerateTokenProvider>(
  'GenerateTokenProvider',
  GenerateTokenProvider,
);

container.registerSingleton<IGenerateCustomLoginTokenProvider>(
  'GenerateCustomLoginTokenProvider',
  GenerateCustomLoginTokenProvider,
);
