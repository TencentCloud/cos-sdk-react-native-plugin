import { NativeModules, Platform, NativeEventEmitter } from 'react-native';
import { CosService } from './cos_service';
import { CosTransferManger } from './cos_transfer';
import { ScopeLimitCredentialsProvider } from './credentials/scope_credentials';
import type { CosXmlServiceConfig, TransferConfig } from './data_model/config';
import { COS_EMITTER_DNS_FETCH, COS_EMITTER_INIT_MULTIPLE_UPLOAD_CALLBACK, COS_EMITTER_LOG_CALLBACK, COS_EMITTER_PROGRESS_CALLBACK, COS_EMITTER_RESULT_FAIL_CALLBACK, COS_EMITTER_RESULT_SUCCESS_CALLBACK, COS_EMITTER_STATE_CALLBACK, COS_EMITTER_UPDATE_CLS_SESSION_CREDENTIAL, COS_EMITTER_UPDATE_SESSION_CREDENTIAL, InitMultipleUploadEvent, LogEvent, TransferProgressEvent, TransferResultFailEvent, TransferResultSuccessEvent, TransferStateEvent, UpdateSessionCredentialEvent } from './data_model/events';
import type { SessionQCloudCredentials, STSCredentialScope } from './data_model/credentials';
import { IllegalArgumentError } from './data_model/errors';
import type { DnsMapParameters } from './data_model/parameters';
import type { LogEntity, LogLevel } from './data_model/log';

const LINKING_ERROR =
  `The package 'react-native-cos-sdk' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const QCloudCosReactNative = NativeModules.QCloudCosReactNative
  ? NativeModules.QCloudCosReactNative
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

const CosEventEmitter = NativeModules.CosEventEmitter
? NativeModules.CosEventEmitter
: new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    }
  );


const DEFAULT_KEY = "";

class Cos {
  private emitter: NativeEventEmitter;
  private initialized: boolean = false;

  private cosServices: Map<string, CosService>;
  private cosTransfers: Map<string, CosTransferManger>;
  private scopeLimitCredentialsProvider: ScopeLimitCredentialsProvider;

  private logListeners: Map<string, (log: LogEntity) => void>;

  constructor() {
    this.cosServices = new Map()
    this.cosTransfers = new Map()
    this.scopeLimitCredentialsProvider = new ScopeLimitCredentialsProvider();

    this.logListeners = new Map()

    if(Platform.OS === 'ios'){
      this.emitter = new NativeEventEmitter(CosEventEmitter);
    } else if(Platform.OS === 'android') {
      this.emitter = new NativeEventEmitter(QCloudCosReactNative);
    } else {
      this.emitter = new NativeEventEmitter();
    }

    this.emitter.addListener(COS_EMITTER_RESULT_SUCCESS_CALLBACK, (event: TransferResultSuccessEvent) => {
      this.getTransferManger(event.transferKey).runResultSuccessCallBack(event.callbackKey, event.headers);
    });
    this.emitter.addListener(COS_EMITTER_RESULT_FAIL_CALLBACK, (event: TransferResultFailEvent) => {
      this.getTransferManger(event.transferKey).runResultFailCallBack(event.callbackKey, event.clientException, event.serviceException);
    });
    this.emitter.addListener(COS_EMITTER_PROGRESS_CALLBACK, (event: TransferProgressEvent) => {
      this.getTransferManger(event.transferKey).runProgressCallBack(event.callbackKey, Number(event.complete), Number(event.target));
    });
    this.emitter.addListener(COS_EMITTER_STATE_CALLBACK, (event: TransferStateEvent) => {
      this.getTransferManger(event.transferKey).runStateCallBack(event.callbackKey, event.state);
    });
    this.emitter.addListener(COS_EMITTER_INIT_MULTIPLE_UPLOAD_CALLBACK, (event: InitMultipleUploadEvent) => {
      this.getTransferManger(event.transferKey).runInitMultipleUploadCallback(event.callbackKey, event.bucket, event.key, event.uploadId);
    });
    this.emitter.addListener(COS_EMITTER_LOG_CALLBACK, (event: LogEvent) => {
      const logEntity: LogEntity = JSON.parse(event.logEntityJson);
      this.logListeners.get(event.key)?.call(this, logEntity);
    });
  }

  initWithPlainSecret(secretId: string, secretKey: string): Promise<void> | undefined {
    if (!this.initialized) {
      this.initialized = true
      return QCloudCosReactNative.initWithPlainSecret(secretId, secretKey)
    } else {
      console.log("COS Service has been inited before.");
      return undefined;
    }
  }

  initWithSessionCredentialCallback(callback: () => Promise<SessionQCloudCredentials | null>): Promise<void> | undefined {
    if (!this.initialized) {
      this.initialized = true
      this.emitter.addListener(COS_EMITTER_UPDATE_SESSION_CREDENTIAL, async () => {
        const credential = await callback()
        if(credential){
          QCloudCosReactNative.updateSessionCredential(credential, null)
        }
      });
      return QCloudCosReactNative.initWithSessionCredentialCallback()
    } else {
      console.log("COS Service has been inited before.");
      return undefined;
    }
  }

  initWithScopeLimitCredentialCallback(callback: (stsScopesArray:Array<STSCredentialScope>) => Promise<SessionQCloudCredentials | null>): Promise<void> | undefined {
    if (!this.initialized) {
      this.initialized = true
      this.emitter.addListener(COS_EMITTER_UPDATE_SESSION_CREDENTIAL, async (event: UpdateSessionCredentialEvent) => {
        console.log(event.stsScopesArrayJson);
        if(event.stsScopesArrayJson){
          const credential = await this.scopeLimitCredentialsProvider.fetchScopeLimitCredentials(event.stsScopesArrayJson, callback);
          if(credential){
            QCloudCosReactNative.updateSessionCredential(credential, event.stsScopesArrayJson)
          }
        }
      });
      return QCloudCosReactNative.initWithScopeLimitCredentialCallback()
    } else {
      console.log("COS Service has been inited before.");
      return undefined;
    }
  }

  /// 初始化自定义 DNS 解析Map
  initCustomerDNS(dnsMap: Array<DnsMapParameters>): Promise<void> | undefined {
    return QCloudCosReactNative.initCustomerDNS(dnsMap);
  }

  /// 初始化自定义 DNS 解析器
  initCustomerDNSFetch(callback: (domain: string) => Promise<Array<string> | null>): Promise<void> | undefined {
    this.emitter.removeAllListeners(COS_EMITTER_DNS_FETCH);
    this.emitter.addListener(COS_EMITTER_DNS_FETCH, async (domain: string) => {
      const ips = await callback(domain)
      QCloudCosReactNative.setDNSFetchIps(domain, ips)
    });
    return QCloudCosReactNative.initCustomerDNSFetch();
  }

  forceInvalidationCredential(): Promise<void>{
    this.scopeLimitCredentialsProvider.forceInvalidationScopeCredentials();
    return QCloudCosReactNative.forceInvalidationCredential();
  }

  setCloseBeacon(isCloseBeacon: boolean): Promise<void>{
    return QCloudCosReactNative.setCloseBeacon(isCloseBeacon)
  }

  async registerDefaultService(config: CosXmlServiceConfig): Promise<CosService>{
    await QCloudCosReactNative.registerDefaultService(config)
    let cosService = new CosService(DEFAULT_KEY, QCloudCosReactNative);
    this.cosServices.set(DEFAULT_KEY, cosService)
    return cosService;
  }
  async registerDefaultTransferManger(config: CosXmlServiceConfig, transferConfig?: TransferConfig): Promise<CosTransferManger>{
    await QCloudCosReactNative.registerDefaultTransferManger(config, transferConfig)
    let cosTransfer = new CosTransferManger(DEFAULT_KEY, QCloudCosReactNative);
    this.cosTransfers.set(DEFAULT_KEY, cosTransfer)
    return cosTransfer;
  }
  async registerService(key: string, config: CosXmlServiceConfig): Promise<CosService>{
    if (key == DEFAULT_KEY) {
      throw new IllegalArgumentError("register key cannot be empty");
    }

    await QCloudCosReactNative.registerService(key, config);
    let cosService = new CosService(key, QCloudCosReactNative);
    this.cosServices.set(key, cosService)
    return cosService;
  }
  async registerTransferManger(key: string, config: CosXmlServiceConfig, transferConfig?: TransferConfig): Promise<CosTransferManger>{
    if (key == DEFAULT_KEY) {
      throw new IllegalArgumentError("register key cannot be empty");
    }
    await QCloudCosReactNative.registerTransferManger(key, config, transferConfig)
    let cosTransfer = new CosTransferManger(key, QCloudCosReactNative);
    this.cosTransfers.set(key, cosTransfer)
    return cosTransfer;
  }

  hasDefaultService(): boolean {
    return this.cosServices.has(DEFAULT_KEY);
  }

  getDefaultService(): CosService {
    if(this.cosServices.has(DEFAULT_KEY)){
      return this.cosServices.get(DEFAULT_KEY)!;
    } else {
      throw new IllegalArgumentError("default service unregistered");
    }
  }

  hasDefaultTransferManger(): boolean {
    return this.cosTransfers.has(DEFAULT_KEY);
  }

  getDefaultTransferManger(): CosTransferManger {
    if(this.cosTransfers.has(DEFAULT_KEY)){
      return this.cosTransfers.get(DEFAULT_KEY)!;
    } else {
      throw new IllegalArgumentError("default transfer manger unregistered");
    }
  }

  hasService(key: string): boolean {
    return this.cosServices.has(key);
  }

  getService(key: string): CosService {
    if(this.cosServices.has(key)){
      return this.cosServices.get(key)!;
    } else {
      throw new IllegalArgumentError(`${key} service unregistered`);
    }
  }

  hasTransferManger(key: string): boolean {
    return this.cosTransfers.has(key);
  }

  getTransferManger(key: string): CosTransferManger {
    if(this.cosTransfers.has(key)){
      return this.cosTransfers.get(key)!;
    } else {
      throw new IllegalArgumentError(`${key} transfer manger unregistered`);
    }
  }

  /// 启用/禁用 Logcat 日志输出
  enableLogcat(enable: boolean): Promise<void> {
    return QCloudCosReactNative.enableLogcat(enable);
  }

  /// 启用/禁用日志文件输出
  enableLogFile(enable: boolean): Promise<void> {
    return QCloudCosReactNative.enableLogFile(enable);
  }

  /// 添加日志监听器
  addLogListener(key: string, callback: (logEntity: LogEntity) => void): Promise<void> {
    this.logListeners.set(key, callback);
    return QCloudCosReactNative.addLogListener(key);
  }

  /// 移除日志监听器
  removeLogListener(key: string): Promise<void> {
    this.logListeners.delete(key);
    return QCloudCosReactNative.removeLogListener(key);
  }

  /// 设置最小日志级别
  setMinLevel(minLevel: LogLevel): Promise<void> {
    return QCloudCosReactNative.setMinLevel(minLevel);
  }

  /// 设置 Logcat 最小日志级别
  setLogcatMinLevel(minLevel: LogLevel): Promise<void> {
    return QCloudCosReactNative.setLogcatMinLevel(minLevel);
  }

  /// 设置日志文件最小级别
  setFileMinLevel(minLevel: LogLevel): Promise<void> {
    return QCloudCosReactNative.setFileMinLevel(minLevel);
  }

  /// 设置 CLS 日志最小级别
  setClsMinLevel(minLevel: LogLevel): Promise<void> {
    return QCloudCosReactNative.setClsMinLevel(minLevel);
  }

  /// 设置设备 ID
  setDeviceID(deviceID: string): Promise<void> {
    return QCloudCosReactNative.setDeviceID(deviceID);
  }

  /// 设置设备型号
  setDeviceModel(deviceModel: string): Promise<void> {
    return QCloudCosReactNative.setDeviceModel(deviceModel);
  }

  /// 设置应用版本
  setAppVersion(appVersion: string): Promise<void> {
    return QCloudCosReactNative.setAppVersion(appVersion);
  }

  /// 设置额外信息
  setExtras(extras: object): Promise<void> {
    return QCloudCosReactNative.setExtras(extras);
  }

  /// 设置日志文件加密密钥
  setLogFileEncryptionKey(key: Uint8Array, iv: Uint8Array): Promise<void> {
    const keyArray = Array.from(key); // 或 [...key]
    const ivArray = Array.from(iv);
    return QCloudCosReactNative.setLogFileEncryptionKey(keyArray, ivArray);
  }

  /// 设置匿名 CLS 通道
  setCLsChannelAnonymous(topicId: string, endpoint: string): Promise<void> {
    return QCloudCosReactNative.setCLsChannelAnonymous(topicId, endpoint);
  }

  /// 设置静态密钥 CLS 通道
  setCLsChannelStaticKey(topicId: string, endpoint: string, secretId: string, secretKey: string): Promise<void> {
    return QCloudCosReactNative.setCLsChannelStaticKey(topicId, endpoint, secretId, secretKey);
  }

  /// 设置会话凭证 CLS 通道
  setCLsChannelSessionCredential(topicId: string, endpoint: string, callback: () => Promise<SessionQCloudCredentials | null>): Promise<void> {
    this.emitter.addListener(COS_EMITTER_UPDATE_CLS_SESSION_CREDENTIAL, async () => {
      const credential = await callback()
      if(credential){
        QCloudCosReactNative.updateCLsChannelSessionCredential(credential)
      }
    });
    return QCloudCosReactNative.setCLsChannelSessionCredential(topicId, endpoint);
  }

  /// 添加敏感信息过滤规则
  addSensitiveRule(ruleName: string, regex: string): Promise<void> {
    return QCloudCosReactNative.addSensitiveRule(ruleName, regex);
  }

  /// 移除敏感信息过滤规则
  removeSensitiveRule(ruleName: string): Promise<void> {
    return QCloudCosReactNative.removeSensitiveRule(ruleName);
  }

  getLogRootDir(): Promise<string> {
     return QCloudCosReactNative.getLogRootDir();
  }

}
export default new Cos()
