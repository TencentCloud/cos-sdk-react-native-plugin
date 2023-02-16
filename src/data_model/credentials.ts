export type SessionQCloudCredentials = {
  tmpSecretId: string;
  tmpSecretKey: string;
  sessionToken: string;
  startTime?: number;
  expiredTime: number
}