import { container } from 'tsyringe';
import { AuthenticateUserResponseDTO } from '../../dtos/IAuthenticateUserResponseDTO';
import { LoginByCustomTokenDTO } from '../../dtos/iLoginByCustomTokenDTO';
import { LoginByCustomTokenUseCase } from './LoginByCustomTokenUseCase';

class LoginByCustomTokenController {
  async handle({
    customLoginToken,
    sessionId,
  }: LoginByCustomTokenDTO): Promise<AuthenticateUserResponseDTO> {
    const loginByCustomTokenUseCase = container.resolve(
      LoginByCustomTokenUseCase,
    );

    const token = await loginByCustomTokenUseCase.execute({
      customLoginToken,
      sessionId,
    });

    return token;
  }
}

export { LoginByCustomTokenController };
