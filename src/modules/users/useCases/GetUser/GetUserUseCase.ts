import { inject, injectable } from 'tsyringe';
import { IUsersRepository } from '../../repositories/IUsersRepository';
import { AppError } from '../../../../shared/errors/AppError';

@injectable()
class GetUserUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) {}

  async execute(id: number) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    return user;
  }
}

export { GetUserUseCase };
