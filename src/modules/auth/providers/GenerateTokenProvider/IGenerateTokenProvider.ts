interface IGenerateTokenProvider {
  generateToken(user_id: number): string;
}

export { IGenerateTokenProvider };
