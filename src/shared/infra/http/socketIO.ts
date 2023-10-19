import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { app } from './app';
import Joi from 'joi';
import { AuthenticateUserController } from '../../../modules/auth/useCases/AuthenticateUser/AuthenticateUserController';
import { AppError } from '../../errors/AppError';
import { RedisTokenCacheProvider } from '../../container/providers/TokenCacheProvider/implementations/RedisTokenCacheProvider';
import { ITokenCacheProvider } from '../../container/providers/TokenCacheProvider/ITokenCacheProvider';

const tokenCacheProvider: ITokenCacheProvider = new RedisTokenCacheProvider();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

io.sockets.sockets.forEach((socket) => {
  console.log(socket.id);
});

io.on('connection', (socket: Socket) => {
  socket.on('login', async (data) => {
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

    const { email, password } = data;

    try {
      const authenticateUserController = new AuthenticateUserController();

      const response = await authenticateUserController.handle({
        email,
        password,
        sessionId: socket.id,
      });

      socket.emit('login', response);
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

  socket.on('disconnect', () => {
    tokenCacheProvider.tokenCacheDel(socket.id);
  });
});

export { httpServer, io };
