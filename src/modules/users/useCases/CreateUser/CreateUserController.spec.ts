import { AppDataSource } from '../../../../shared/infra/database/AppDataSource';
import { app } from '../../../../shared/infra/http/app';
import request from 'supertest';
import { redisRateLimiterClient } from '../../../../utils/redis-rate-limiter';

describe('Create user controller', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();

    await AppDataSource.runMigrations();
  });

  afterAll(async () => {
    await AppDataSource.dropDatabase();

    await AppDataSource.destroy();

    redisRateLimiterClient.disconnect();
  });

  it('should be able to create a new user', async () => {
    const response = await request(app).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: '12345678',
    });

    expect(response.status).toBe(201);
  });

  it('should not be able to create a new user with an email that is already in use', async () => {
    const response = await request(app).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@email',
      password: '12345678',
    });

    expect(response.status).toBe(400);
  });
});
