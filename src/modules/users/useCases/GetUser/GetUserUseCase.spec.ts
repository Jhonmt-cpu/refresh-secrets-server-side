import { AppError } from '../../../../shared/errors/AppError';
import { ICreateUserDTO } from '../../dtos/CreateUserDTO';
import { UsersRepositoryInMemory } from '../../repositories/inMemory/UsersRepositoryInMemory';
import { CreateUserUseCase } from '../CreateUser/CreateUserUseCase';
import { GetUserUseCase } from './GetUserUseCase';

let usersRepositoryInMemory: UsersRepositoryInMemory;

let createUserUseCase: CreateUserUseCase;
let getUserUseCase: GetUserUseCase;

describe('Get user', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new UsersRepositoryInMemory();

    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    getUserUseCase = new GetUserUseCase(usersRepositoryInMemory);
  });

  it('should be able to get a user', async () => {
    const user: ICreateUserDTO = {
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: '123456',
    };

    const userCreated = await createUserUseCase.execute(user);

    const userResponse = await getUserUseCase.execute(userCreated.user_id);

    expect(userResponse).toHaveProperty('user_id');
    expect(userResponse.user_id).toEqual(userCreated.user_id);
  });

  it('should not be able to get a non existing user', async () => {
    const user: ICreateUserDTO = {
      name: 'John Doe',
      email: 'jogndoe@email.com',
      password: '123456',
    };

    const userCreated = await createUserUseCase.execute(user);

    await expect(
      getUserUseCase.execute(userCreated.user_id + 1),
    ).rejects.toEqual(new AppError('User not found.', 404));
  });
});
