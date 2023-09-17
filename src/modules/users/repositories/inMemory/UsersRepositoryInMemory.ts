import { UserEntity } from '../../infra/typeorm/entities/UserEntity';
import { ICreateUser, IUsersRepository } from '../IUsersRepository';

class UsersRepositoryInMemory implements IUsersRepository {
  users: UserEntity[] = [];

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = this.users.find((user) => user.email === email);

    return user || null;
  }

  async findById(user_id: number): Promise<UserEntity | null> {
    const user = this.users.find((user) => user.user_id === user_id);

    return user || null;
  }

  async createUser({
    name,
    email,
    password,
  }: ICreateUser): Promise<UserEntity> {
    const user = new UserEntity();

    Object.assign(user, {
      user_id: this.users.length + 1,
      name,
      email,
      password,
      created_at: new Date(),
    });

    this.users.push(user);

    return user;
  }

  async delete(user_id: number): Promise<void> {
    const newUsers = this.users.filter((user) => user.user_id !== user_id);

    this.users = newUsers;
  }
}

export { UsersRepositoryInMemory };
