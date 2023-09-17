import { AppDataSource } from '../../../../../shared/infra/database/AppDataSource';
import {
  ICreateUser,
  IUsersRepository,
} from '../../../repositories/IUsersRepository';
import { UserEntity } from '../entities/UserEntity';

class UsersRepository implements IUsersRepository {
  private repository = AppDataSource.getRepository(UserEntity);

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.repository.findOne({
      where: { email },
    });

    return user;
  }

  async findById(user_id: number): Promise<UserEntity | null> {
    const user = await this.repository.findOne({
      where: { user_id },
    });

    return user;
  }

  async createUser({
    name,
    email,
    password,
  }: ICreateUser): Promise<UserEntity> {
    const user = this.repository.create({
      name,
      email,
      password,
    });

    await this.repository.insert(user);

    return user;
  }

  async delete(user_id: number): Promise<void> {
    await this.repository.delete(user_id);
  }
}

export { UsersRepository };
