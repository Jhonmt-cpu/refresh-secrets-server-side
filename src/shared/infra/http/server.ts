import 'dotenv/config';
import 'reflect-metadata';
import 'express-async-errors';
import { container } from 'tsyringe';
import { scheduleJob } from 'node-schedule';

import { ChangeTokenSecretUseCase } from '../../../modules/auth/useCases/ChangeTokenSecret/ChangeTokenSecretUseCase';
import { SynchronizeCacheUseCase } from '../../../modules/auth/useCases/SynchronizeCache/SynchronizeCacheUseCase';
import { AppDataSource } from '../database/AppDataSource';
import { app } from './app';

AppDataSource.initialize().then(async () => {
  console.log('Database initialized');

  const synchronizeCacheUseCase = container.resolve(SynchronizeCacheUseCase);

  synchronizeCacheUseCase.execute();
});

app.listen(3333, () => console.log('Server is running on port 3333'));

scheduleJob('0 0 * * *', async () => {
  console.log('Changing token secret');

  const changeTokenSecretUseCase = new ChangeTokenSecretUseCase();

  await changeTokenSecretUseCase.execute();

  console.log('Token secret changed');

  console.log('Synchronizing cache');

  const synchronizeCacheUseCase = container.resolve(SynchronizeCacheUseCase);

  await synchronizeCacheUseCase.execute();

  console.log('Cache synchronized');
});
