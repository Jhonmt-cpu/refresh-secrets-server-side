import { hash } from 'bcryptjs';
import { ICreateUserDTO } from '../../dtos/CreateUserDTO';
import { UserEntity } from '../../infra/typeorm/entities/UserEntity';
import { AppError } from '../../../../shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import { IUsersRepository } from '../../repositories/IUsersRepository';

@injectable()
class CreateUserUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) {}

  async execute({
    name,
    email,
    password,
  }: ICreateUserDTO): Promise<UserEntity> {
    const userAlreadyExists = await this.usersRepository.findByEmail(email);

    if (userAlreadyExists) {
      throw new AppError('User already exists.');
    }

    const passwordHash = await hash(password, 8);

    const user = await this.usersRepository.createUser({
      name,
      email,
      password: passwordHash,
    });

    return user;
  }
}

export { CreateUserUseCase };
