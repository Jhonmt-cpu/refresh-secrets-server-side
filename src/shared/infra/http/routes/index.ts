import { Router } from 'express';
import { Segments, celebrate } from 'celebrate';
import Joi from 'joi';
import { CreateUserController } from '../../../../modules/users/useCases/CreateUser/CreateUserController';
import { GetUserController } from '../../../../modules/users/useCases/GetUser/GetUserController';
import { AuthenticateUserController } from '../../../../modules/auth/useCases/AuthenticateUser/AuthenticateUserController';
import { RefreshTokenController } from '../../../../modules/auth/useCases/RefreshToken/RefreshTokenController';
import { SynchronizeCacheController } from '../../../../modules/auth/useCases/SynchronizeCache/SynchronizeCacheController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { ensureAdmin } from '../middlewares/ensureAdmin';
import { DeleteUserController } from '../../../../modules/users/useCases/DeleteUser/DeleteUserController';

const router = Router();

const createUserController = new CreateUserController();
const getUserController = new GetUserController();
const deleteUserController = new DeleteUserController();
const authenticateUserController = new AuthenticateUserController();
const refreshAccessTokenController = new RefreshTokenController();
const synchronizeCacheController = new SynchronizeCacheController();

router.post(
  '/users',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required().min(8),
    },
  }),
  createUserController.handle,
);

router.get('/users', ensureAuthenticated, getUserController.handle);

router.delete(
  '/users/:user_id',
  celebrate({
    [Segments.PARAMS]: {
      user_id: Joi.number().required(),
    },
  }),
  ensureAuthenticated,
  deleteUserController.handle,
);

router.post(
  '/login',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().email().required(),
      password: Joi.string().required().min(8),
    },
  }),
  authenticateUserController.handle,
);

router.post(
  '/refresh',
  celebrate({
    [Segments.BODY]: {
      refresh_token: Joi.string().required(),
    },
  }),
  refreshAccessTokenController.handle,
);

router.post(
  '/synchronize-cache',
  ensureAuthenticated,
  ensureAdmin,
  synchronizeCacheController.handle,
);

router.get('/', (request, response) => {
  return response.json({ message: 'Hello World' });
});

export { router };
