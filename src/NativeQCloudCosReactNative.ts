import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  // Init
  initWithPlainSecret(secretId: string, secretKey: string): Promise<void>;
  initWithSessionCredentialCallback(): Promise<void>;
  initWithScopeLimitCredentialCallback(): Promise<void>;

  // DNS
  initCustomerDNS(dnsArray: Object[]): Promise<void>;
  initCustomerDNSFetch(): Promise<void>;
  setDNSFetchIps(domain: string, ips: string[] | null): Promise<void>;

  // Credentials
  forceInvalidationCredential(): Promise<void>;
  updateSessionCredential(
    credential: Object,
    stsScopesKey: string | null
  ): Promise<void>;

  // Config
  setCloseBeacon(isCloseBeacon: boolean): Promise<void>;

  // Service & TransferManager registration
  registerDefaultService(config: Object): Promise<void>;
  registerDefaultTransferManger(
    config: Object,
    transferConfig: Object | null
  ): Promise<void>;
  registerService(key: string, config: Object): Promise<void>;
  registerTransferManger(
    key: string,
    config: Object,
    transferConfig: Object | null
  ): Promise<void>;

  // Object operations
  headObject(
    serviceKey: string,
    bucket: string,
    cosPath: string,
    region: string | null,
    versionId: string | null,
    credential: Object | null
  ): Promise<Object>;
  deleteObject(
    serviceKey: string,
    bucket: string,
    cosPath: string,
    region: string | null,
    versionId: string | null,
    credential: Object | null
  ): Promise<void>;
  getObjectUrl(
    serviceKey: string,
    bucket: string,
    key: string,
    region: string
  ): Promise<string>;
  getPresignedUrl(
    serviceKey: string,
    bucket: string,
    cosPath: string,
    signValidTime: string | null,
    signHost: string | null,
    parameters: Object | null,
    region: string | null,
    credential: Object | null
  ): Promise<string>;
  preBuildConnection(serviceKey: string, bucket: string): Promise<void>;
  doesObjectExist(
    serviceKey: string,
    bucket: string,
    cosPath: string
  ): Promise<boolean>;

  // Service (ListBuckets)
  getService(
    serviceKey: string,
    credential: Object | null
  ): Promise<Object>;

  // Bucket operations
  getBucket(
    serviceKey: string,
    bucket: string,
    region: string | null,
    prefix: string | null,
    delimiter: string | null,
    encodingType: string | null,
    marker: string | null,
    maxKeys: string | null,
    credential: Object | null
  ): Promise<Object>;
  putBucket(
    serviceKey: string,
    bucket: string,
    region: string | null,
    enableMAZ: string | null,
    cosacl: string | null,
    readAccount: string | null,
    writeAccount: string | null,
    readWriteAccount: string | null,
    credential: Object | null
  ): Promise<void>;
  headBucket(
    serviceKey: string,
    bucket: string,
    region: string | null,
    credential: Object | null
  ): Promise<Object>;
  deleteBucket(
    serviceKey: string,
    bucket: string,
    region: string | null,
    credential: Object | null
  ): Promise<void>;
  doesBucketExist(serviceKey: string, bucket: string): Promise<boolean>;

  // Bucket accelerate
  getBucketAccelerate(
    serviceKey: string,
    bucket: string,
    region: string | null,
    credential: Object | null
  ): Promise<Object>;
  putBucketAccelerate(
    serviceKey: string,
    bucket: string,
    region: string | null,
    enable: boolean,
    credential: Object | null
  ): Promise<void>;

  // Bucket location
  getBucketLocation(
    serviceKey: string,
    bucket: string,
    region: string | null,
    credential: Object | null
  ): Promise<Object>;

  // Bucket versioning
  getBucketVersioning(
    serviceKey: string,
    bucket: string,
    region: string | null,
    credential: Object | null
  ): Promise<Object>;
  putBucketVersioning(
    serviceKey: string,
    bucket: string,
    region: string | null,
    enable: boolean,
    credential: Object | null
  ): Promise<void>;

  // Cancel
  cancelAll(serviceKey: string): Promise<void>;

  // Transfer operations
  upload(
    transferKey: string,
    bucket: string,
    cosPath: string,
    fileUri: string,
    uploadId: string | null,
    resultCallbackKey: string | null,
    stateCallbackKey: string | null,
    progressCallbackKey: string | null,
    initMultipleUploadCallbackKey: string | null,
    stroageClass: string | null,
    trafficLimit: string | null,
    region: string | null,
    credential: Object | null
  ): Promise<string>;
  download(
    transferKey: string,
    bucket: string,
    cosPath: string,
    savePath: string,
    resultCallbackKey: string | null,
    stateCallbackKey: string | null,
    progressCallbackKey: string | null,
    versionId: string | null,
    trafficLimit: string | null,
    region: string | null,
    credential: Object | null
  ): Promise<string>;
  pause(transferKey: string, taskId: string): Promise<void>;
  resume(transferKey: string, taskId: string): Promise<void>;
  cancel(transferKey: string, taskId: string): Promise<void>;

  // Log
  enableLogcat(enable: boolean): Promise<void>;
  enableLogFile(enable: boolean): Promise<void>;
  addLogListener(key: string): Promise<void>;
  removeLogListener(key: string): Promise<void>;
  setMinLevel(minLevel: number): Promise<void>;
  setLogcatMinLevel(minLevel: number): Promise<void>;
  setFileMinLevel(minLevel: number): Promise<void>;
  setClsMinLevel(minLevel: number): Promise<void>;
  setDeviceID(deviceID: string): Promise<void>;
  setDeviceModel(deviceModel: string): Promise<void>;
  setAppVersion(appVersion: string): Promise<void>;
  setExtras(extras: Object): Promise<void>;
  setLogFileEncryptionKey(
    key: number[],
    iv: number[]
  ): Promise<void>;
  getLogRootDir(): Promise<string>;

  // CLS
  setCLsChannelAnonymous(topicId: string, endpoint: string): Promise<void>;
  setCLsChannelStaticKey(
    topicId: string,
    endpoint: string,
    secretId: string,
    secretKey: string
  ): Promise<void>;
  setCLsChannelSessionCredential(
    topicId: string,
    endpoint: string
  ): Promise<void>;
  updateCLsChannelSessionCredential(credential: Object): Promise<void>;

  // Event emitter support
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  'QCloudCosReactNative'
);
