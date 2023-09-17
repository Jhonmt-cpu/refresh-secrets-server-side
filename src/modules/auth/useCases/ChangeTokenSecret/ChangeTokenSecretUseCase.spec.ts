import auth from '../../../../config/auth';
import { ChangeTokenSecretUseCase } from './ChangeTokenSecretUseCase';

let changeTokenSecretUseCase: ChangeTokenSecretUseCase;

describe('Change jwt secret', () => {
  beforeEach(() => {
    changeTokenSecretUseCase = new ChangeTokenSecretUseCase();
  });

  it('should be able to change jwt secret', async () => {
    const currentJwtSecret = auth.jwt.jwtSecret;

    await changeTokenSecretUseCase.execute();

    expect(auth.jwt.jwtSecret).not.toEqual(currentJwtSecret);
  });
});
