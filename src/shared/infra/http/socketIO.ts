import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { app } from './app';
import Joi from 'joi';
import { AuthenticateUserController } from '../../../modules/auth/useCases/AuthenticateUser/AuthenticateUserController';
import { AppError } from '../../errors/AppError';
import { RedisTokenCacheProvider } from '../../container/providers/TokenCacheProvider/implementations/RedisTokenCacheProvider';
import { ITokenCacheProvider } from '../../container/providers/TokenCacheProvider/ITokenCacheProvider';
import { LoginStatus } from '../../../modules/auth/dtos/IAuthenticateUserResponseDTO';
import { LoginByCustomTokenController } from '../../../modules/auth/useCases/LoginByCustomToken/LoginByCustomTokenController';
import rateLimiterSocketIO from './middlewares/socketIORateLimiter';

const tokenCacheProvider: ITokenCacheProvider = new RedisTokenCacheProvider();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket: Socket) => {
  socket.on('login', async (data) => {
    try {
      //#region Validation

      await rateLimiterSocketIO(socket.id, 'login');

      const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required().min(8),
      });

      const { error } = schema.validate(data);

      if (error) {
        return socket.emit('login', {
          error: error.details[0].message,
        });
      }

      //#endregion

      const { email, password } = data;

      const authenticateUserController = new AuthenticateUserController();

      const response = await authenticateUserController.handle({
        email,
        password,
        sessionId: socket.id,
      });

      if (response.status === LoginStatus.custom_token) {
        socket.emit('login_by_custom_token', response);
      } else {
        socket.emit('login', response);
      }
    } catch (e) {
      if (e instanceof AppError) {
        return socket.emit('login', {
          error: e.message,
        });
      }

      console.log(e);

      return socket.emit('login', {
        error: 'Internal server error',
      });
    }
  });

  socket.on('login_by_custom_token', async (data) => {
    try {
      await rateLimiterSocketIO(socket.id, 'login_by_custom_token');

      const schema = Joi.object({
        customLoginToken: Joi.string().required(),
      });

      const { error } = schema.validate(data);

      if (error) {
        return socket.emit('login_by_custom_token', {
          error: error.details[0].message,
        });
      }

      const { customLoginToken } = data;

      const loginByCustomTokenController = new LoginByCustomTokenController();

      const response = await loginByCustomTokenController.handle({
        customLoginToken,
        sessionId: socket.id,
      });

      socket.emit('login', response);
    } catch (e) {
      if (e instanceof AppError) {
        return socket.emit('login_by_custom_token', {
          error: e.message,
        });
      }

      console.log(e);

      return socket.emit('login_by_custom_token', {
        error: 'Internal server error',
      });
    }
  });

  socket.on('disconnect', () => {
    tokenCacheProvider.tokenCacheDeleteAllBySuffix(socket.id);
  });
});

export { httpServer, io };
