import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { DeleteUserUseCase } from './DeleteUserUseCase';

class DeleteUserController {
  async handle(request: Request, response: Response): Promise<Response> {
    const userId = request.user.id;

    const userIdParam = request.params.user_id;

    const deleteUserUseCase = container.resolve(DeleteUserUseCase);

    await deleteUserUseCase.execute({
      id: userId,
      id_param: userIdParam,
    });

    return response.status(200).send();
  }
}

export { DeleteUserController };
