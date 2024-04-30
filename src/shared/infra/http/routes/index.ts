import { Router } from 'express';
import { Segments, celebrate } from 'celebrate';
import Joi from 'joi';
import { CreateUserController } from '../../../../modules/users/useCases/CreateUser/CreateUserController';
import { GetUserController } from '../../../../modules/users/useCases/GetUser/GetUserController';
import { EnsureAuthenticated } from '../middlewares/ensureAuthenticated';
import { DeleteUserController } from '../../../../modules/users/useCases/DeleteUser/DeleteUserController';

const router = Router();

const createUserController = new CreateUserController();
const getUserController = new GetUserController();
const deleteUserController = new DeleteUserController();

const ensureAuthenticated = new EnsureAuthenticated();

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

router.get('/users', ensureAuthenticated.handle, getUserController.handle);

router.delete(
  '/users/:user_id',
  celebrate({
    [Segments.PARAMS]: {
      user_id: Joi.number().required(),
    },
  }),
  ensureAuthenticated.handle,
  deleteUserController.handle,
);

router.get('/', (request, response) => {
  return response.json({ message: 'Hello World' });
});

export { router };
