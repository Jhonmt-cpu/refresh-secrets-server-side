import request from 'supertest';

import { AppDataSource } from '../../../../shared/infra/database/AppDataSource';
import { redisRateLimiterClient } from '../../../../utils/redis-rate-limiter';
import { app } from '../../../../shared/infra/http/app';

describe('Authenticate user controller', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();

    await AppDataSource.runMigrations();
  });

  afterAll(async () => {
    await AppDataSource.dropDatabase();

    await AppDataSource.destroy();

    redisRateLimiterClient.disconnect();
  });

  it('should be able to authenticate a user', async () => {
    const user = {
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: '12345678',
    };

    await request(app).post('/users').send(user);

    const response = await request(app).post('/login').send({
      email: user.email,
      password: user.password,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should not be able to authenticate a non existing user', async () => {
    const user = {
      name: 'John Doe',
      email: 'johndoe2@email.com',
      password: '12345678',
    };

    const response = await request(app).post('/login').send({
      email: 'invalid@email.com',
      password: user.password,
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });

  it('should not be able to authenticate a user with wrong password', async () => {
    const user = {
      name: 'John Doe',
      email: 'johndoe3@email.com',
      password: '12345678',
    };

    await request(app).post('/users').send(user);

    const response = await request(app)
      .post('/login')
      .send({
        email: user.email,
        password: user.password + 'wrong password',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });
});
