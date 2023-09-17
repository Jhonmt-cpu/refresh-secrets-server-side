import request from 'supertest';
import { v4 as UUID } from 'uuid';

import { AppDataSource } from '../../../../shared/infra/database/AppDataSource';
import { redisRateLimiterClient } from '../../../../utils/redis-rate-limiter';
import { app } from '../../../../shared/infra/http/app';

describe('Refresh token controller', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();

    await AppDataSource.runMigrations();
  });

  afterAll(async () => {
    await AppDataSource.dropDatabase();

    await AppDataSource.destroy();

    redisRateLimiterClient.disconnect();
  });

  it('should be able to refresh a token', async () => {
    const user = {
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: '12345678',
    };

    await request(app).post('/users').send(user);

    const userAuthenticated = await request(app).post('/login').send({
      email: user.email,
      password: user.password,
    });

    const { refresh_token } = userAuthenticated.body;

    const response = await request(app).post('/refresh').send({
      refresh_token,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('refresh_token');
    expect(response.body.refresh_token).not.toEqual(refresh_token);
  });

  it('should not be able to refresh a invalid refresh token', async () => {
    const response = await request(app).post('/refresh').send({
      refresh_token: UUID(),
    });

    expect(response.status).toBe(400);
  });

  it('should not be able to refresh a refresh token that is already used', async () => {
    const user = {
      name: 'John Doe 3',
      email: 'johndoe3@email.com',
      password: '12345678',
    };

    await request(app).post('/users').send(user);

    const userAuthenticated = await request(app).post('/login').send({
      email: user.email,
      password: user.password,
    });

    const { refresh_token } = userAuthenticated.body;

    await request(app).post('/refresh').send({
      refresh_token,
    });

    const response = await request(app).post('/refresh').send({
      refresh_token,
    });

    expect(response.status).toBe(400);
  });

  it('should not be able to refresh a refresh token that is already expired', async () => {
    const user = {
      name: 'John Doe 3',
      email: 'johndoe3@email.com',
      password: '12345678',
    };

    await request(app).post('/users').send(user);

    const userAuthenticated = await request(app).post('/login').send({
      email: user.email,
      password: user.password,
    });

    const { refresh_token, token } = userAuthenticated.body;

    const [, refresh_token_splitted] = refresh_token.split(':');

    await AppDataSource.query(
      `UPDATE refresh_tokens SET expires_in = '2000-01-01 00:00:00' WHERE refresh_token = '${refresh_token_splitted}'`,
    );

    await request(app)
      .post('/synchronize-cache')
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app).post('/refresh').send({
      refresh_token,
    });

    expect(response.status).toBe(400);
  });
});
