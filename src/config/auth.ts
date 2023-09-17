import { v4 as uuid } from 'uuid';

export default {
  jwt: {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    jwtSecret: uuid(),
  },
  refresh: {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30',
  },
};
