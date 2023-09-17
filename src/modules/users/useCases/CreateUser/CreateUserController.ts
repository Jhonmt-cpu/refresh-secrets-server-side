import { Request, Response } from 'express';
import { instanceToPlain } from 'class-transformer';
import { CreateUserUseCase } from './CreateUserUseCase';
import { container } from 'tsyringe';

class CreateUserController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { name, email, password } = request.body;

    const createUserUseCase = container.resolve(CreateUserUseCase);

    const user = await createUserUseCase.execute({ name, email, password });

    return response.status(201).json(instanceToPlain(user));
  }
}

export { CreateUserController };
