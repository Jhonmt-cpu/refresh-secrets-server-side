import { AppError } from '../../../../shared/errors/AppError';
import { ICreateUserDTO } from '../../dtos/CreateUserDTO';
import { UsersRepositoryInMemory } from '../../repositories/inMemory/UsersRepositoryInMemory';
import { CreateUserUseCase } from './CreateUserUseCase';

let usersRepositoryInMemory: UsersRepositoryInMemory;

let createUserUseCase: CreateUserUseCase;

describe('Create User', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new UsersRepositoryInMemory();

    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it('should be able to create a new user', async () => {
    const user: ICreateUserDTO = {
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: '123456',
    };

    const userCreated = await createUserUseCase.execute(user);

    expect(userCreated).toHaveProperty('user_id');
  });

  it('should not be able to create a new user with email already exists', async () => {
    const user: ICreateUserDTO = {
      name: 'John Doe',
      email: 'jogndoe@email.com',
      password: '123456',
    };

    await createUserUseCase.execute(user);

    await expect(createUserUseCase.execute(user)).rejects.toEqual(
      new AppError('User already exists.'),
    );
  });
});
