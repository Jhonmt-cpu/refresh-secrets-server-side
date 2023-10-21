enum LoginStatus {
  login_success = 'login_success',
  custom_token = 'custom_token',
}

interface AuthenticateUserResponseDTO {
  email: string;
  name: string;
  token: string;
  status: LoginStatus;
}

export { AuthenticateUserResponseDTO, LoginStatus };
