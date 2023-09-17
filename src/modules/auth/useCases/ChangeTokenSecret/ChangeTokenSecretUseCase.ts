import { v4 as uuid } from 'uuid';
import auth from '../../../../config/auth';

class ChangeTokenSecretUseCase {
  async execute() {
    auth.jwt.jwtSecret = uuid();
  }
}

export { ChangeTokenSecretUseCase };
