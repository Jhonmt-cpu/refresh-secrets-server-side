import { AuthenticateUserUseCase } from './AuthenticateUserUseCase';
import { container } from 'tsyringe';
import { AuthenticateUserDTO } from '../../dtos/IAuthenticateUserDTO';
import { AuthenticateUserResponseDTO } from '../../dtos/IAuthenticateUserResponseDTO';

class AuthenticateUserController {
  async handle({
    email,
    password,
    sessionId,
  }: AuthenticateUserDTO): Promise<AuthenticateUserResponseDTO> {
    const authenticateUserUseCase = container.resolve(AuthenticateUserUseCase);

    const token = await authenticateUserUseCase.execute({
      email,
      password,
      sessionId,
    });

    return token;
  }
}

export { AuthenticateUserController };
