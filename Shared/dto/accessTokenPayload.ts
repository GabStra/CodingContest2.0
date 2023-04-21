export interface AccessTokenPayload {
  sessionId: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
}
