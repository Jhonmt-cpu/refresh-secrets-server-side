import request from 'supertest';

import { AppDataSource } from '../../../../shared/infra/database/AppDataSource';
import { redisRateLimiterClient } from '../../../../utils/redis-rate-limiter';
import { app } from '../../../../shared/infra/http/app';

describe('Synchronize cache controller', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();

    await AppDataSource.runMigrations();
  });

  afterAll(async () => {
    await AppDataSource.dropDatabase();

    await AppDataSource.destroy();

    redisRateLimiterClient.disconnect();
  });

  it('should be able to synchronize cache', async () => {
    const user = {
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: '12345678',
    };

    const user2 = {
      name: 'John Doe 2',
      email: 'johndoe2@email.com',
      password: '12345678',
    };

    const user3 = {
      name: 'John Doe 3',
      email: 'johndoe3@email.com',
      password: '12345678',
    };

    await request(app).post('/users').send(user);

    await request(app).post('/users').send(user2);

    await request(app).post('/users').send(user3);

    const user1Authenticated = await request(app).post('/login').send({
      email: user.email,
      password: user.password,
    });

    const user2Authenticated = await request(app).post('/login').send({
      email: user2.email,
      password: user2.password,
    });

    const user3Authenticated = await request(app).post('/login').send({
      email: user3.email,
      password: user3.password,
    });

    const { token, refresh_token: refresh_token_used } =
      user1Authenticated.body;

    const { refresh_token: refresh_token_valid } = user2Authenticated.body;

    const { refresh_token: refresh_token_expired } = user3Authenticated.body;

    await request(app).post('/refresh').send({
      refresh_token: refresh_token_used,
    });

    const [, refresh_token_splitted] = refresh_token_expired.split(':');

    await AppDataSource.query(
      `UPDATE refresh_tokens SET expires_in = '2000-01-01 00:00:00' WHERE refresh_token = '${refresh_token_splitted}'`,
    );

    await request(app)
      .post('/synchronize-cache')
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    const refreshTokenUsedResponse = await request(app).post('/refresh').send({
      refresh_token: refresh_token_used,
    });

    const refreshTokenValidResponse = await request(app).post('/refresh').send({
      refresh_token: refresh_token_valid,
    });

    const refreshTokenExpiredResponse = await request(app)
      .post('/refresh')
      .send({
        refresh_token: refresh_token_expired,
      });

    expect(refreshTokenUsedResponse.status).toBe(400);
    expect(refreshTokenUsedResponse.body.message).toEqual(
      'Refresh token already used.',
    );
    expect(refreshTokenValidResponse.status).toBe(200);
    expect(refreshTokenExpiredResponse.status).toBe(400);
    expect(refreshTokenExpiredResponse.body.message).toEqual(
      'Refresh token invalid.',
    );
  });
});
