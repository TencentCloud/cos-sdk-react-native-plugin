export type CosXmlServiceConfig = {
  region?: string;
  connectionTimeout?: number;
  socketTimeout?: number;
  isHttps?: boolean;
  host?: string;
  hostFormat?: string;
  port?: number;
  isDebuggable?: boolean;
  signInUrl?: boolean;
  userAgent?: string;
  dnsCache?: boolean;
  accelerate?: boolean;
  domainSwitch?: boolean;
}

export type TransferConfig = {
  divisionForUpload?: number;
  sliceSizeForUpload?: number;
  forceSimpleUpload?: boolean;
  enableVerification?: boolean;
}