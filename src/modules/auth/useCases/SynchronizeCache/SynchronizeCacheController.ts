import { Request, Response } from 'express';
import { SynchronizeCacheUseCase } from './SynchronizeCacheUseCase';
import { container } from 'tsyringe';

class SynchronizeCacheController {
  async handle(request: Request, response: Response): Promise<Response> {
    const synchronizeCacheUseCase = container.resolve(SynchronizeCacheUseCase);

    await synchronizeCacheUseCase.execute();

    return response.status(200).send();
  }
}

export { SynchronizeCacheController };
