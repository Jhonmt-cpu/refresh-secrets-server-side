import request from 'supertest';

import { AppDataSource } from '../../../../shared/infra/database/AppDataSource';
import { redisRateLimiterClient } from '../../../../utils/redis-rate-limiter';
import { app } from '../../../../shared/infra/http/app';

describe('Get user controller', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();

    await AppDataSource.runMigrations();
  });

  afterAll(async () => {
    await AppDataSource.dropDatabase();

    await AppDataSource.destroy();

    redisRateLimiterClient.disconnect();
  });

  it('should be able to get a user', async () => {
    const user = {
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: '12345678',
    };

    await request(app).post('/users').send(user);

    const userAuthentication = await request(app).post('/login').send({
      email: user.email,
      password: user.password,
    });

    const { token } = userAuthentication.body;

    const getUserResponse = await request(app)
      .get(`/users`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(getUserResponse.status).toBe(200);
    expect(getUserResponse.body).toHaveProperty('user_id');
  });

  it('should not be able to get a non existing user', async () => {
    const user = {
      name: 'John Doe 2',
      email: 'johndoe2@email.com',
      password: '12345678',
    };

    const createUserResponse = await request(app).post('/users').send(user);

    const userAuthentication = await request(app).post('/login').send({
      email: user.email,
      password: user.password,
    });

    const { token } = userAuthentication.body;

    const { user_id } = createUserResponse.body;

    await AppDataSource.query(`DELETE FROM users WHERE user_id = ${user_id}`);

    const getUserResponse = await request(app)
      .get(`/users`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(getUserResponse.status).toBe(404);
  });
});
