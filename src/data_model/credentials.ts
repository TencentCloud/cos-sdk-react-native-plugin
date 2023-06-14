export type SessionQCloudCredentials = {
  tmpSecretId: string;
  tmpSecretKey: string;
  sessionToken: string;
  startTime?: number;
  expiredTime: number
}

export type STSCredentialScope = {
  action: string;
  region: string;
  bucket?: string;
  prefix?: string;
}