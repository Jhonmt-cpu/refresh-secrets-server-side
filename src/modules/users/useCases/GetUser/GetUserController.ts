import { Request, Response } from 'express';
import { instanceToPlain } from 'class-transformer';
import { GetUserUseCase } from './GetUserUseCase';
import { container } from 'tsyringe';

class GetUserController {
  async handle(request: Request, response: Response): Promise<Response> {
    const user = request.user;

    const getUserUseCase = container.resolve(GetUserUseCase);

    const userFound = await getUserUseCase.execute(Number(user.id));

    return response.status(200).json(instanceToPlain(userFound));
  }
}

export { GetUserController };
