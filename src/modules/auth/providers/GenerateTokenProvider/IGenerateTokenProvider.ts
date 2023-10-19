interface IGenerateToken {
  userId: number;
  sessionId: string;
}

interface IGenerateTokenProvider {
  generateToken({ userId, sessionId }: IGenerateToken): Promise<string>;
}

export { IGenerateTokenProvider, IGenerateToken };
