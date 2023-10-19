import 'dotenv/config';
import 'reflect-metadata';
import 'express-async-errors';
import { scheduleJob } from 'node-schedule';

import { ChangeTokenSecretUseCase } from '../../../modules/auth/useCases/ChangeTokenSecret/ChangeTokenSecretUseCase';
import { AppDataSource } from '../database/AppDataSource';
import { httpServer } from './socketIO';

AppDataSource.initialize().then(async () => {
  console.log('Database initialized');
});

scheduleJob('0 0 * * *', async () => {
  console.log('Changing token secret');

  const changeTokenSecretUseCase = new ChangeTokenSecretUseCase();

  await changeTokenSecretUseCase.execute();

  console.log('Token secret changed');
});

httpServer.listen(3333, () => console.log('Server is running on port 3333'));
