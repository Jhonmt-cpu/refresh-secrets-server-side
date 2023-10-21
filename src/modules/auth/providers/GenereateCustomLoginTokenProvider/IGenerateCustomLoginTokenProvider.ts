interface IGenerateCustomLoginToken {
  userId: number;
  sessionId: string;
}

interface IGenerateCustomLoginTokenProvider {
  generateToken({
    userId,
    sessionId,
  }: IGenerateCustomLoginToken): Promise<string>;
}

export { IGenerateCustomLoginTokenProvider, IGenerateCustomLoginToken };
