import { inject, injectable } from 'tsyringe';
import { AppError } from '../../../../shared/errors/AppError';
import { IUsersRepository } from '../../repositories/IUsersRepository';
import { ITokenCacheProvider } from '../../../../shared/container/providers/TokenCacheProvider/ITokenCacheProvider';

interface IDeleteUser {
  id: string;
  id_param?: string;
}

@injectable()
class DeleteUserUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
    @inject('TokenCacheProvider')
    private tokenCacheProvider: ITokenCacheProvider,
  ) {}

  async execute({ id, id_param }: IDeleteUser): Promise<void> {
    const userIdNumber = Number(id);

    let userToBeDeleted: number;

    if (id_param && id_param !== id) {
      const userAdmin = await this.usersRepository.findById(userIdNumber);

      if (!userAdmin) {
        throw new AppError('User not found');
      }

      if (!userAdmin.is_admin) {
        throw new AppError('User is not found');
      }

      userToBeDeleted = Number(id_param);
    } else {
      userToBeDeleted = userIdNumber;
    }

    const user = await this.usersRepository.findById(userToBeDeleted);

    if (!user) {
      throw new AppError('User not found');
    }

    await this.usersRepository.delete(userToBeDeleted);

    await this.tokenCacheProvider.tokenCacheDeleteAllByPrefix(
      userToBeDeleted.toString(),
    );
  }
}

export { DeleteUserUseCase };
