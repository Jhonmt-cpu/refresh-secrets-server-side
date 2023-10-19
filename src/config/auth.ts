import { v4 as uuid } from 'uuid';

export default {
  jwt: {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    expiresInMinutes: process.env.JWT_EXPIRES_IN_MINUTES || 15,
    jwtSecret: uuid(),
  },
  aes: {
    secretKey: uuid(),
    iv: uuid(),
    method: 'aes-256-cbc',
  },
};
