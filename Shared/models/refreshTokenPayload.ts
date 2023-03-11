export interface RefreshTokenPayload {
  userId: string;
  rememberMe: boolean;
  iat: number;
  exp: number;
}
